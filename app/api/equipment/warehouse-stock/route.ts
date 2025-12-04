import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import {
  getSession,
  hasPermission,
} from "@/lib/server/accessControl";

type StockLine = {
  item_id: string;
  quantity: number;
};

type StockActionBody =
  | {
      action: "add";
      warehouseId: string;
      lines: StockLine[];
      note?: string | null;
    }
  | {
      action: "transfer";
      sourceWarehouseId: string;
      targetWarehouseId: string;
      lines: StockLine[];
      note?: string | null;
    };

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

function normalizeLines(raw: any[]): StockLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map<StockLine | null>((line) => {
      if (!line) return null;
      const itemId =
        typeof line.item_id === "string" ? line.item_id.trim() : "";
      const quantity = Number(line.quantity);
      if (!itemId || Number.isNaN(quantity) || quantity <= 0) {
        return null;
      }
      return { item_id: itemId, quantity };
    })
    .filter((line): line is StockLine => Boolean(line));
}

const ADD_STOCK_SQL = `
DECLARE @Now DATETIME2 = SYSUTCDATETIME();

DECLARE @Lines TABLE (
  item_id UNIQUEIDENTIFIER NOT NULL,
  quantity DECIMAL(14,2) NOT NULL
);

INSERT INTO @Lines (item_id, quantity)
SELECT
  TRY_CONVERT(UNIQUEIDENTIFIER, JSON_VALUE(value, '$.item_id')) AS item_id,
  TRY_CONVERT(DECIMAL(14,2), JSON_VALUE(value, '$.quantity')) AS quantity
FROM OPENJSON(@linesJson);

IF EXISTS (SELECT 1 FROM @Lines WHERE item_id IS NULL OR quantity IS NULL OR quantity <= 0)
BEGIN
  THROW 50011, 'INVALID_LINES', 1;
END;

BEGIN TRY
  BEGIN TRAN;

  MERGE equipment_stock AS target
  USING @Lines AS source
    ON target.item_id = source.item_id
   AND target.warehouse_id = @warehouseId
  WHEN MATCHED THEN
    UPDATE SET
      quantity = target.quantity + source.quantity,
      updated_at = @Now
  WHEN NOT MATCHED THEN
    INSERT (item_id, warehouse_id, quantity, reserved_qty, updated_at)
    VALUES (source.item_id, @warehouseId, source.quantity, 0, @Now);

  COMMIT;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK;
  DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
  DECLARE @ErrSeverity INT = ERROR_SEVERITY();
  DECLARE @ErrState INT = ERROR_STATE();
  RAISERROR(@Err, @ErrSeverity, @ErrState);
END CATCH;
`;

const TRANSFER_STOCK_SQL = `
DECLARE @Now DATETIME2 = SYSUTCDATETIME();

DECLARE @Lines TABLE (
  item_id UNIQUEIDENTIFIER NOT NULL,
  quantity DECIMAL(14,2) NOT NULL
);

INSERT INTO @Lines (item_id, quantity)
SELECT
  TRY_CONVERT(UNIQUEIDENTIFIER, JSON_VALUE(value, '$.item_id')) AS item_id,
  TRY_CONVERT(DECIMAL(14,2), JSON_VALUE(value, '$.quantity')) AS quantity
FROM OPENJSON(@linesJson);

IF EXISTS (SELECT 1 FROM @Lines WHERE item_id IS NULL OR quantity IS NULL OR quantity <= 0)
BEGIN
  THROW 50011, 'INVALID_LINES', 1;
END;

IF EXISTS (
  SELECT 1
  FROM @Lines l
  OUTER APPLY (
    SELECT quantity
    FROM equipment_stock
    WHERE item_id = l.item_id
      AND warehouse_id = @sourceWarehouseId
  ) as existing(quantity)
  WHERE existing.quantity IS NULL OR existing.quantity < l.quantity
)
BEGIN
  THROW 50012, 'INSUFFICIENT_STOCK', 1;
END;

BEGIN TRY
  BEGIN TRAN;

  UPDATE es
  SET
    es.quantity = es.quantity - l.quantity,
    es.updated_at = @Now
  FROM equipment_stock es
  JOIN @Lines l
    ON es.item_id = l.item_id
  WHERE es.warehouse_id = @sourceWarehouseId;

  MERGE equipment_stock AS target
  USING @Lines AS source
    ON target.item_id = source.item_id
   AND target.warehouse_id = @targetWarehouseId
  WHEN MATCHED THEN
    UPDATE SET
      quantity = target.quantity + source.quantity,
      updated_at = @Now
  WHEN NOT MATCHED THEN
    INSERT (item_id, warehouse_id, quantity, reserved_qty, updated_at)
    VALUES (source.item_id, @targetWarehouseId, source.quantity, 0, @Now);

  DELETE FROM equipment_stock WHERE quantity <= 0;

  COMMIT;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK;
  DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
  DECLARE @ErrSeverity INT = ERROR_SEVERITY();
  DECLARE @ErrState INT = ERROR_STATE();
  RAISERROR(@Err, @ErrSeverity, @ErrState);
END CATCH;
`;

export async function GET(req: Request) {
  try {
    const permission = await ensureInventoryPermission("read");
    if (!permission.allowed) {
      return NextResponse.json(
        { error: "אין לך הרשאה לצפות במלאי המחסנים." },
        { status: permission.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const warehouseId = searchParams.get("warehouseId");

    const result = await query(
      `
        SELECT
          es.item_id,
          ei.name AS item_name,
          es.quantity,
          es.warehouse_id,
          w.name AS warehouse_name,
          ei.equipment_type,
          ei.condition
        FROM equipment_stock es
        JOIN equipment_item ei ON ei.id = es.item_id
        JOIN warehouse w ON w.id = es.warehouse_id
        WHERE (@warehouseId IS NULL OR es.warehouse_id = @warehouseId)
        ORDER BY w.name, ei.name
      `,
      { warehouseId }
    );

    return NextResponse.json({
      success: true,
      data: result.recordset,
    });
  } catch (err: any) {
    console.error("Error loading warehouse stock:", err);
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
        { error: "אין לך הרשאה לעדכן מלאי מחסנים." },
        { status: permission.status }
      );
    }

    const session = permission.session;
    const body = (await req.json()) as StockActionBody;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Body is required." },
        { status: 400 }
      );
    }

    const lines = normalizeLines((body as any).lines);
    if (!lines.length) {
      return NextResponse.json(
        { error: "יש להזין לפחות פריט אחד עם כמות חיובית." },
        { status: 400 }
      );
    }

    if (body.action === "add") {
      if (!body.warehouseId) {
        return NextResponse.json(
          { error: "יש לבחור מחסן יעד." },
          { status: 400 }
        );
      }

      await query(ADD_STOCK_SQL, {
        warehouseId: body.warehouseId,
        linesJson: JSON.stringify(lines),
        createdBy: session?.national_id || "system",
        note: body.note || null,
      });

      return NextResponse.json({ success: true });
    }

    if (body.action === "transfer") {
      if (!body.sourceWarehouseId || !body.targetWarehouseId) {
        return NextResponse.json(
          { error: "יש לבחור מחסן מקור ומחסן יעד." },
          { status: 400 }
        );
      }
      if (body.sourceWarehouseId === body.targetWarehouseId) {
        return NextResponse.json(
          { error: "מחסן המקור והיעד לא יכולים להיות זהים." },
          { status: 400 }
        );
      }

      await query(TRANSFER_STOCK_SQL, {
        sourceWarehouseId: body.sourceWarehouseId,
        targetWarehouseId: body.targetWarehouseId,
        linesJson: JSON.stringify(lines),
        createdBy: session?.national_id || "system",
        note: body.note || null,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Unsupported action." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Error updating warehouse stock:", err);
    const rawMessage = err?.message || "";
    let statusCode = 500;
    let message = "Server error";

    if (typeof rawMessage === "string") {
      if (rawMessage.includes("INSUFFICIENT_STOCK")) {
        message = "אין די מלאי במחסן המקור.";
        statusCode = 400;
      } else if (rawMessage.includes("INVALID_LINES")) {
        message = "נתוני הפריטים אינם תקינים.";
        statusCode = 400;
      } else {
        message = rawMessage;
      }
    }

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

