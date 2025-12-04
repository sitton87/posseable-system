import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import {
  getSession,
  hasPermission,
} from "@/lib/server/accessControl";

type ReceiptLinePayload = {
  item_id: string;
  warehouse_id: string;
  quantity: number;
  unit_cost: number | null;
  supplier_identifier: string | null;
};

function generateDocumentCode() {
  const now = new Date();
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const HH = String(now.getUTCHours()).padStart(2, "0");
  const randomPart = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `${dd}${mm}${HH}${randomPart}`;
}

function normalizeLines(raw: any[]): ReceiptLinePayload[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map<ReceiptLinePayload | null>((line) => {
      if (!line) return null;
      const itemId =
        typeof line.item_id === "string" ? line.item_id.trim() : "";
      const warehouseId =
        typeof line.warehouse_id === "string" ? line.warehouse_id.trim() : "";
      const quantity = Number(line.quantity);
      const unitCost =
        line.unit_cost === undefined || line.unit_cost === null || line.unit_cost === ""
          ? null
          : Number(line.unit_cost);
      const supplier =
        typeof line.supplier_identifier === "string" &&
        line.supplier_identifier.trim().length
          ? line.supplier_identifier.trim()
          : null;

      if (
        !itemId ||
        !warehouseId ||
        Number.isNaN(quantity) ||
        quantity <= 0
      ) {
        return null;
      }

      return {
        item_id: itemId,
        warehouse_id: warehouseId,
        quantity,
        unit_cost:
          unitCost === null || Number.isNaN(unitCost) ? null : unitCost,
        supplier_identifier: supplier,
      };
    })
    .filter((line): line is ReceiptLinePayload => Boolean(line));
}

const SAVE_RECEIPT_SQL = `
DECLARE @Now DATETIME2 = SYSUTCDATETIME();
DECLARE @IncomingDocument NVARCHAR(100) = @documentCode;
DECLARE @HasExisting BIT = 0;

IF EXISTS (
  SELECT 1
  FROM equipment_stock_ledger
  WHERE movement_type = 'RECEIPT'
    AND reference_doc = @IncomingDocument
)
BEGIN
  SET @HasExisting = 1;
END;

DECLARE @Lines TABLE (
  item_id UNIQUEIDENTIFIER NOT NULL,
  warehouse_id UNIQUEIDENTIFIER NOT NULL,
  quantity DECIMAL(14,2) NOT NULL,
  unit_cost DECIMAL(14,2) NULL,
  supplier_identifier NVARCHAR(100) NULL
);

INSERT INTO @Lines (item_id, warehouse_id, quantity, unit_cost, supplier_identifier)
SELECT
  TRY_CONVERT(UNIQUEIDENTIFIER, JSON_VALUE(value, '$.item_id')) AS item_id,
  TRY_CONVERT(UNIQUEIDENTIFIER, JSON_VALUE(value, '$.warehouse_id')) AS warehouse_id,
  TRY_CONVERT(DECIMAL(14,2), JSON_VALUE(value, '$.quantity')) AS quantity,
  TRY_CONVERT(DECIMAL(14,2), JSON_VALUE(value, '$.unit_cost')) AS unit_cost,
  JSON_VALUE(value, '$.supplier_identifier') AS supplier_identifier
FROM OPENJSON(@linesJson);

IF NOT EXISTS (SELECT 1 FROM @Lines)
BEGIN
  THROW 50000, 'NO_LINES', 1;
END;

IF EXISTS (
  SELECT 1 FROM @Lines
  WHERE item_id IS NULL OR warehouse_id IS NULL OR quantity IS NULL OR quantity <= 0
)
BEGIN
  THROW 50001, 'INVALID_LINES', 1;
END;

IF EXISTS (
  SELECT 1
  FROM @Lines l
  LEFT JOIN equipment_item ei ON ei.id = l.item_id
  WHERE ei.id IS NULL
)
BEGIN
  THROW 50002, 'ITEM_NOT_FOUND', 1;
END;

IF EXISTS (
  SELECT 1
  FROM @Lines l
  LEFT JOIN warehouse w ON w.id = l.warehouse_id
  WHERE w.id IS NULL
)
BEGIN
  THROW 50003, 'WAREHOUSE_NOT_FOUND', 1;
END;

BEGIN TRY
  BEGIN TRAN;

  IF @HasExisting = 1
  BEGIN
    DECLARE @ExistingLines TABLE (
      item_id UNIQUEIDENTIFIER NOT NULL,
      warehouse_id UNIQUEIDENTIFIER NOT NULL,
      quantity DECIMAL(14,2) NOT NULL
    );

    INSERT INTO @ExistingLines (item_id, warehouse_id, quantity)
    SELECT
      item_id,
      warehouse_id,
      quantity
    FROM equipment_stock_ledger
    WHERE movement_type = 'RECEIPT'
      AND reference_doc = @IncomingDocument;

    UPDATE es
    SET
      es.quantity = es.quantity - prev.quantity,
      es.updated_at = @Now
    FROM equipment_stock es
    JOIN @ExistingLines prev
      ON es.item_id = prev.item_id
     AND es.warehouse_id = prev.warehouse_id;

    DELETE FROM equipment_stock_ledger
    WHERE movement_type = 'RECEIPT'
      AND reference_doc = @IncomingDocument;
  END

  MERGE equipment_stock AS target
  USING @Lines AS source
    ON target.item_id = source.item_id
   AND target.warehouse_id = source.warehouse_id
  WHEN MATCHED THEN
    UPDATE SET
      quantity = target.quantity + source.quantity,
      updated_at = @Now
  WHEN NOT MATCHED THEN
    INSERT (item_id, warehouse_id, quantity, reserved_qty, updated_at)
    VALUES (source.item_id, source.warehouse_id, source.quantity, 0, @Now);

  INSERT INTO equipment_stock_ledger (
    id,
    item_id,
    warehouse_id,
    receipt_item_id,
    movement_type,
    quantity,
    movement_date,
    reference_doc,
    created_by,
    notes
  )
  SELECT
    NEWID(),
    item_id,
    warehouse_id,
    NULL,
    'RECEIPT',
    quantity,
    @Now,
    @IncomingDocument,
    @createdBy,
    (
      SELECT
        @note AS doc_note,
        supplier_identifier AS supplier_identifier,
        unit_cost AS unit_cost
      FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    )
  FROM @Lines;

  DELETE FROM equipment_stock
  WHERE quantity <= 0;

  COMMIT;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK;
  DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
  DECLARE @ErrSeverity INT = ERROR_SEVERITY();
  DECLARE @ErrState INT = ERROR_STATE();
  RAISERROR(@Err, @ErrSeverity, @ErrState);
END CATCH;

SELECT
  @IncomingDocument AS document_code,
  @Now AS receipt_date,
  (SELECT SUM(quantity) FROM @Lines) AS total_items;
`;

type PermissionResult = {
  allowed: boolean;
  status: number;
  session: Awaited<ReturnType<typeof getSession>> | null;
};

async function ensureInventoryPermission(
  required: "read" | "write"
): Promise<PermissionResult> {
  const session = await getSession();
  if (!session?.national_id) {
    return { allowed: false, session: null, status: 401 };
  }

  const allowed =
    (await hasPermission(session.role_group_code, "equipment-inventory", required)) ||
    (await hasPermission(session.role_group_code, "equipment", required));

  if (!allowed) {
    return { allowed: false, session, status: 403 };
  }

  return { allowed: true, session, status: 200 };
}

export async function GET(req: Request) {
  try {
    const permission = await ensureInventoryPermission("read");
    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: "אין לך הרשאה לצפות בקליטות המלאי.",
        },
        { status: permission.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const documentCode =
      searchParams.get("document") ?? searchParams.get("document_code");

    if (documentCode) {
      const headerResult = await query(
        `
          SELECT
            MIN(movement_date) AS receipt_date,
            SUM(quantity) AS total_items,
            COALESCE(
              MAX(JSON_VALUE(notes, '$.doc_note')),
              MAX(CASE WHEN notes IS NOT NULL AND notes NOT LIKE '{%' THEN notes END)
            ) AS note
          FROM equipment_stock_ledger
          WHERE movement_type = 'RECEIPT'
            AND reference_doc = @document
        `,
        { document: documentCode }
      );

      if (!headerResult.recordset.length) {
        return NextResponse.json(
          { error: "תעודה לא נמצאה." },
          { status: 404 }
        );
      }

      const linesResult = await query(
        `
          SELECT
            l.item_id,
            ei.name AS item_name,
            l.warehouse_id,
            w.name AS warehouse_name,
            l.quantity,
            TRY_CONVERT(DECIMAL(14,2), JSON_VALUE(l.notes, '$.unit_cost')) AS unit_cost,
            JSON_VALUE(l.notes, '$.supplier_identifier') AS supplier_identifier
          FROM equipment_stock_ledger l
          JOIN equipment_item ei ON ei.id = l.item_id
          JOIN warehouse w ON w.id = l.warehouse_id
          WHERE l.movement_type = 'RECEIPT'
            AND l.reference_doc = @document
          ORDER BY l.movement_date ASC
        `,
        { document: documentCode }
      );

      const header = headerResult.recordset[0];
      const lines = (linesResult.recordset || []).map((row: any) => ({
        item_id: row.item_id,
        item_name: row.item_name,
        warehouse_id: row.warehouse_id,
        warehouse_name: row.warehouse_name,
        quantity: Number(row.quantity) || 0,
        unit_cost:
          row.unit_cost === null || row.unit_cost === undefined
            ? null
            : Number(row.unit_cost),
        supplier_identifier: row.supplier_identifier || null,
      }));

      return NextResponse.json({
        success: true,
        receipt: {
          document_code: documentCode,
          receipt_date: header.receipt_date,
          total_items: Number(header.total_items) || 0,
          note: header.note || null,
          lines,
        },
      });
    }

    const result = await query(
      `
        SELECT TOP 25
          reference_doc AS document_code,
          MIN(movement_date) AS receipt_date,
          SUM(quantity) AS total_items,
          COALESCE(
            MAX(JSON_VALUE(notes, '$.doc_note')),
            MAX(CASE WHEN notes IS NOT NULL AND notes NOT LIKE '{%' THEN notes END)
          ) AS note,
          MAX(JSON_VALUE(notes, '$.supplier_identifier')) AS supplier_identifier
        FROM equipment_stock_ledger
        WHERE movement_type = 'RECEIPT'
        GROUP BY reference_doc
        ORDER BY receipt_date DESC
      `
    );

    const entries = (result.recordset || []).map((row: any) => ({
      id: row.document_code,
      document_code: row.document_code,
      receipt_date: row.receipt_date,
      supplier_name: row.supplier_identifier || null,
      total_items: Number(row.total_items) || 0,
      status: "נקלט",
      note: row.note || undefined,
    }));

    return NextResponse.json({ success: true, data: entries });
  } catch (err: any) {
    console.error("Error loading receipt history:", err);
    return NextResponse.json(
      { error: "Server error", details: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const permission = await ensureInventoryPermission("write");
    if (!permission.allowed) {
      return NextResponse.json(
        {
          error: "אין לך הרשאה לקלוט מלאי.",
        },
        { status: permission.status }
      );
    }

    const session = permission.session;
    const body = await req.json();
    const normalizedLines = normalizeLines(body.lines);

    if (!normalizedLines.length) {
      return NextResponse.json(
        { error: "יש להזין לפחות שורת קליטה אחת תקינה." },
        { status: 400 }
      );
    }

    const note =
      typeof body.note === "string" && body.note.trim().length
        ? body.note.trim()
        : null;
    const providedDoc =
      typeof body.document_code === "string" && body.document_code.trim().length
        ? body.document_code.trim()
        : null;
    const documentCode = (providedDoc || generateDocumentCode()).slice(0, 60);

    const result = await query(SAVE_RECEIPT_SQL, {
      linesJson: JSON.stringify(normalizedLines),
      documentCode,
      note,
      createdBy: session?.national_id || "system",
    });

    const summary = result.recordset?.[0];

    return NextResponse.json({
      success: true,
      receipt: {
        document_code: documentCode,
        receipt_date: summary?.receipt_date,
        total_items: Number(summary?.total_items ?? 0),
        status: "נקלט",
      },
    });
  } catch (err: any) {
    console.error("Error saving inventory receipt:", err);
    const rawMessage = err?.message || "";
    let statusCode = 500;
    let message = "Server error";

    if (typeof rawMessage === "string") {
      if (rawMessage.includes("ITEM_NOT_FOUND")) {
        message = "פריט אחד או יותר לא נמצאו במערכת.";
        statusCode = 400;
      } else if (rawMessage.includes("WAREHOUSE_NOT_FOUND")) {
        message = "מחסן אחד או יותר לא תקינים.";
        statusCode = 400;
      } else if (rawMessage.includes("INVALID_LINES")) {
        message = "נתוני הקליטה אינם תקינים.";
        statusCode = 400;
      } else if (rawMessage.includes("NO_LINES")) {
        message = "חובה להזין לפחות שורת קליטה אחת.";
        statusCode = 400;
      } else {
        message = rawMessage;
      }
    }

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

