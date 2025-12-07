import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import {
  getSession,
  hasPermission,
} from "@/lib/server/accessControl";

const INVENTORY_ACTIONS = [
  "RECEIPT",
  "DONATION",
  "DISPOSAL",
  "TRANSFER",
  "ACTIVITY_OUT",
  "ACTIVITY_RETURN",
  "STOCKTAKE_ADJUST",
] as const;

type InventoryAction = (typeof INVENTORY_ACTIONS)[number];

type DocumentLinePayload = {
  item_id: string;
  quantity: number;
  unit_cost: number | null;
  source_warehouse_id: string | null;
  target_warehouse_id: string | null;
  supplier_document_number: string | null;
};

let inventoryDocumentColumnsEnsured = false;

async function ensureInventoryDocumentColumns() {
  if (inventoryDocumentColumnsEnsured) return;
  await query(`
    IF COL_LENGTH('dbo.inventory_document', 'external_party') IS NULL
    BEGIN
      ALTER TABLE dbo.inventory_document ADD external_party NVARCHAR(200) NULL;
    END
  `);
  await query(`
    IF COL_LENGTH('dbo.inventory_document', 'donor_national_id') IS NULL
    BEGIN
      ALTER TABLE dbo.inventory_document ADD donor_national_id VARCHAR(9) NULL;
      IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'donor')
      BEGIN
        ALTER TABLE dbo.inventory_document
        ADD CONSTRAINT FK_inventory_document_donor FOREIGN KEY (donor_national_id)
        REFERENCES dbo.donor(national_id);
      END
    END
  `);
  await query(`
    IF COL_LENGTH('dbo.inventory_document', 'supplier_document_type') IS NULL
    BEGIN
      ALTER TABLE dbo.inventory_document ADD supplier_document_type NVARCHAR(100) NULL;
    END
  `);
  await query(`
    IF COL_LENGTH('dbo.inventory_document_line', 'supplier_document_number') IS NULL
    BEGIN
      ALTER TABLE dbo.inventory_document_line ADD supplier_document_number NVARCHAR(100) NULL;
    END
  `);
  inventoryDocumentColumnsEnsured = true;
}

const SAVE_DOCUMENT_SQL = `
DECLARE @Now DATETIME2(3) = SYSUTCDATETIME();
DECLARE @EffectiveDocumentDate DATETIME2(3) = COALESCE(@documentDate, @Now);
DECLARE @NormalizedActionType NVARCHAR(40) = UPPER(@actionType);

DECLARE @DocumentIdentifier UNIQUEIDENTIFIER = NULL;
DECLARE @ExistingDocumentId UNIQUEIDENTIFIER = @documentId;
DECLARE @DocumentNumber BIGINT = NULL;
DECLARE @LedgerMovementType NVARCHAR(20) = 'adjustment';

DECLARE @Lines TABLE (
  line_no INT IDENTITY(1,1),
  item_id UNIQUEIDENTIFIER NOT NULL,
  quantity DECIMAL(18,2) NOT NULL,
  unit_cost DECIMAL(18,2) NULL,
  supplier_document_number NVARCHAR(100) NULL,
  source_warehouse_id UNIQUEIDENTIFIER NULL,
  target_warehouse_id UNIQUEIDENTIFIER NULL
);

INSERT INTO @Lines (
  item_id,
  quantity,
  unit_cost,
  supplier_document_number,
  source_warehouse_id,
  target_warehouse_id
)
SELECT
  TRY_CONVERT(UNIQUEIDENTIFIER, JSON_VALUE(value, '$.item_id')),
  TRY_CONVERT(DECIMAL(18,2), JSON_VALUE(value, '$.quantity')),
  TRY_CONVERT(DECIMAL(18,2), JSON_VALUE(value, '$.unit_cost')),
  NULLIF(JSON_VALUE(value, '$.supplier_document_number'), ''),
  TRY_CONVERT(UNIQUEIDENTIFIER, JSON_VALUE(value, '$.source_warehouse_id')),
  TRY_CONVERT(UNIQUEIDENTIFIER, JSON_VALUE(value, '$.target_warehouse_id'))
FROM OPENJSON(@linesJson);

UPDATE l
SET
  unit_cost = COALESCE(l.unit_cost, ei.purchase_cost, 0)
FROM @Lines l
JOIN equipment_item ei ON ei.id = l.item_id;

IF NOT EXISTS (SELECT 1 FROM @Lines)
BEGIN
  THROW 61000, 'NO_LINES', 1;
END;

IF EXISTS (
  SELECT 1
  FROM @Lines
  WHERE item_id IS NULL OR quantity IS NULL
)
BEGIN
  THROW 61001, 'INVALID_LINES', 1;
END;

IF @NormalizedActionType <> 'STOCKTAKE_ADJUST'
BEGIN
  IF EXISTS (
    SELECT 1 FROM @Lines WHERE quantity <= 0
  )
  BEGIN
    THROW 61002, 'INVALID_QUANTITY', 1;
  END;
END
ELSE
BEGIN
  IF EXISTS (
    SELECT 1 FROM @Lines WHERE quantity = 0
  )
  BEGIN
    THROW 61003, 'ZERO_ADJUSTMENT', 1;
  END;
END;

IF EXISTS (
  SELECT 1
  FROM @Lines l
  LEFT JOIN equipment_item ei ON ei.id = l.item_id
  WHERE ei.id IS NULL
)
BEGIN
  THROW 61004, 'ITEM_NOT_FOUND', 1;
END;

IF @NormalizedActionType IN ('RECEIPT', 'DONATION')
BEGIN
  IF EXISTS (SELECT 1 FROM @Lines WHERE target_warehouse_id IS NULL)
  BEGIN
    THROW 61005, 'TARGET_REQUIRED', 1;
  END;
END;

IF @NormalizedActionType = 'DISPOSAL'
BEGIN
  IF EXISTS (SELECT 1 FROM @Lines WHERE source_warehouse_id IS NULL)
  BEGIN
    THROW 61006, 'SOURCE_REQUIRED', 1;
  END;
END;

IF @NormalizedActionType = 'TRANSFER'
BEGIN
  IF EXISTS (
    SELECT 1
    FROM @Lines
    WHERE source_warehouse_id IS NULL OR target_warehouse_id IS NULL
  )
  BEGIN
    THROW 61007, 'SOURCE_AND_TARGET_REQUIRED', 1;
  END;
END;

IF @NormalizedActionType = 'STOCKTAKE_ADJUST'
BEGIN
  IF EXISTS (SELECT 1 FROM @Lines WHERE target_warehouse_id IS NULL)
  BEGIN
    THROW 61008, 'TARGET_REQUIRED', 1;
  END;
END;

IF EXISTS (
  SELECT 1
  FROM @Lines l
  LEFT JOIN warehouse w
    ON w.id = COALESCE(l.source_warehouse_id, l.target_warehouse_id)
  WHERE w.id IS NULL
)
BEGIN
  THROW 61009, 'WAREHOUSE_NOT_FOUND', 1;
END;

IF @ExistingDocumentId IS NOT NULL
BEGIN
  SELECT
    @DocumentNumber = document_number
  FROM inventory_document
  WHERE id = @ExistingDocumentId;

  IF @DocumentNumber IS NULL
  BEGIN
    THROW 61011, 'DOCUMENT_NOT_FOUND', 1;
  END;

  DECLARE @Revert TABLE (
    item_id UNIQUEIDENTIFIER NOT NULL,
    warehouse_id UNIQUEIDENTIFIER NOT NULL,
    quantity DECIMAL(18,2) NOT NULL
  );

  INSERT INTO @Revert (item_id, warehouse_id, quantity)
  SELECT
    item_id,
    warehouse_id,
    quantity
  FROM equipment_stock_ledger
  WHERE reference_doc = CONVERT(NVARCHAR(50), @DocumentNumber);

  MERGE equipment_stock AS target
  USING @Revert AS source
    ON target.item_id = source.item_id
   AND target.warehouse_id = source.warehouse_id
  WHEN MATCHED THEN
    UPDATE SET
      quantity = target.quantity - source.quantity,
      updated_at = @Now
  WHEN NOT MATCHED THEN
    INSERT (item_id, warehouse_id, quantity, reserved_qty, updated_at)
    VALUES (source.item_id, source.warehouse_id, -source.quantity, 0, @Now);

  DELETE FROM equipment_stock WHERE quantity <= 0;

  DELETE FROM equipment_stock_ledger
  WHERE reference_doc = CONVERT(NVARCHAR(50), @DocumentNumber);

  DELETE FROM inventory_document_line WHERE document_id = @ExistingDocumentId;

  SET @DocumentIdentifier = @ExistingDocumentId;
END

DECLARE @StockAdjustments TABLE (
  item_id UNIQUEIDENTIFIER NOT NULL,
  warehouse_id UNIQUEIDENTIFIER NOT NULL,
  delta DECIMAL(18,2) NOT NULL
);

DECLARE @LedgerRows TABLE (
  row_no INT IDENTITY(1,1),
  item_id UNIQUEIDENTIFIER NOT NULL,
  warehouse_id UNIQUEIDENTIFIER NOT NULL,
  quantity DECIMAL(18,2) NOT NULL,
  unit_cost DECIMAL(18,2) NULL,
  supplier_document_number NVARCHAR(100) NULL,
  direction NVARCHAR(10) NOT NULL,
  source_warehouse_id UNIQUEIDENTIFIER NULL,
  target_warehouse_id UNIQUEIDENTIFIER NULL
);

IF @NormalizedActionType IN ('RECEIPT', 'DONATION')
BEGIN
  SET @LedgerMovementType = 'receipt';
  INSERT INTO @StockAdjustments (item_id, warehouse_id, delta)
  SELECT item_id, target_warehouse_id, quantity FROM @Lines;

  INSERT INTO @LedgerRows (
    item_id,
    warehouse_id,
    quantity,
    unit_cost,
    supplier_document_number,
    direction,
    source_warehouse_id,
    target_warehouse_id
  )
  SELECT
    item_id,
    target_warehouse_id,
    quantity,
    unit_cost,
    supplier_document_number,
    'IN',
    source_warehouse_id,
    target_warehouse_id
  FROM @Lines;
END
ELSE IF @NormalizedActionType = 'DISPOSAL'
BEGIN
  SET @LedgerMovementType = 'delete';
  INSERT INTO @StockAdjustments (item_id, warehouse_id, delta)
  SELECT item_id, source_warehouse_id, -quantity FROM @Lines;

  INSERT INTO @LedgerRows (
    item_id,
    warehouse_id,
    quantity,
    unit_cost,
    supplier_document_number,
    direction,
    source_warehouse_id,
    target_warehouse_id
  )
  SELECT
    item_id,
    source_warehouse_id,
    -quantity,
    unit_cost,
    supplier_document_number,
    'OUT',
    source_warehouse_id,
    target_warehouse_id
  FROM @Lines;
END
ELSE IF @NormalizedActionType IN ('TRANSFER', 'ACTIVITY_OUT', 'ACTIVITY_RETURN')
BEGIN
  SET @LedgerMovementType = 'adjustment';
  INSERT INTO @StockAdjustments (item_id, warehouse_id, delta)
  SELECT item_id, source_warehouse_id, -quantity FROM @Lines
  UNION ALL
  SELECT item_id, target_warehouse_id, quantity FROM @Lines;

  INSERT INTO @LedgerRows (
    item_id,
    warehouse_id,
    quantity,
    unit_cost,
    supplier_document_number,
    direction,
    source_warehouse_id,
    target_warehouse_id
  )
  SELECT
    item_id,
    source_warehouse_id,
    -quantity,
    unit_cost,
    supplier_document_number,
    'OUT',
    source_warehouse_id,
    target_warehouse_id
  FROM @Lines
  UNION ALL
  SELECT
    item_id,
    target_warehouse_id,
    quantity,
    unit_cost,
    supplier_document_number,
    'IN',
    source_warehouse_id,
    target_warehouse_id
  FROM @Lines;
END
ELSE IF @NormalizedActionType = 'STOCKTAKE_ADJUST'
BEGIN
  SET @LedgerMovementType = 'adjustment';
  INSERT INTO @StockAdjustments (item_id, warehouse_id, delta)
  SELECT item_id, target_warehouse_id, quantity FROM @Lines;

  INSERT INTO @LedgerRows (
    item_id,
    warehouse_id,
    quantity,
    unit_cost,
    supplier_document_number,
    direction,
    source_warehouse_id,
    target_warehouse_id
  )
  SELECT
    item_id,
    target_warehouse_id,
    quantity,
    unit_cost,
    supplier_document_number,
    CASE WHEN quantity >= 0 THEN 'IN' ELSE 'OUT' END,
    source_warehouse_id,
    target_warehouse_id
  FROM @Lines;
END;

DECLARE @Aggregated TABLE (
  item_id UNIQUEIDENTIFIER NOT NULL,
  warehouse_id UNIQUEIDENTIFIER NOT NULL,
  delta DECIMAL(18,2) NOT NULL
);

INSERT INTO @Aggregated (item_id, warehouse_id, delta)
SELECT
  item_id,
  warehouse_id,
  SUM(delta) AS delta
FROM @StockAdjustments
GROUP BY item_id, warehouse_id;

IF @NormalizedActionType IN ('DISPOSAL', 'TRANSFER')
BEGIN
  IF EXISTS (
    SELECT 1
    FROM @Aggregated agg
    LEFT JOIN equipment_stock es
      ON es.item_id = agg.item_id
     AND es.warehouse_id = agg.warehouse_id
    WHERE agg.delta < 0
      AND (
        es.item_id IS NULL
        OR es.quantity + agg.delta < 0
      )
  )
  BEGIN
    THROW 61010, 'INSUFFICIENT_STOCK', 1;
  END;
END;

DECLARE @Inserted TABLE (
  id UNIQUEIDENTIFIER,
  document_number BIGINT
);

BEGIN TRY
  BEGIN TRAN;

  MERGE equipment_stock AS target
  USING @Aggregated AS source
    ON target.item_id = source.item_id
   AND target.warehouse_id = source.warehouse_id
  WHEN MATCHED THEN
    UPDATE SET
      quantity = target.quantity + source.delta,
      updated_at = @Now
  WHEN NOT MATCHED AND source.delta > 0 THEN
    INSERT (item_id, warehouse_id, quantity, reserved_qty, updated_at)
    VALUES (source.item_id, source.warehouse_id, source.delta, 0, @Now);

  DELETE FROM equipment_stock WHERE quantity <= 0;

  IF @DocumentIdentifier IS NULL
  BEGIN
    INSERT INTO inventory_document (
      action_type,
      document_date,
      source_warehouse_id,
      target_warehouse_id,
      activity_id,
      supplier_identifier,
      supplier_document_type,
      donor_national_id,
      reference_number,
      notes,
      external_party,
      created_by,
      created_at
    )
    OUTPUT inserted.id, inserted.document_number
    INTO @Inserted
    VALUES (
      @NormalizedActionType,
      @EffectiveDocumentDate,
      NULL,
      NULL,
      NULL,
      @supplierIdentifier,
      NULLIF(@supplierDocumentType, ''),
      @donorId,
      NULL,
      NULLIF(@notes, ''),
      NULLIF(@externalParty, ''),
      @createdBy,
      @Now
    );

    SELECT
      @DocumentIdentifier = id,
      @DocumentNumber = document_number
    FROM @Inserted;
  END
  ELSE
  BEGIN
    UPDATE inventory_document
    SET
      action_type = @NormalizedActionType,
      document_date = @EffectiveDocumentDate,
      source_warehouse_id = NULL,
      target_warehouse_id = NULL,
      activity_id = NULL,
      supplier_identifier = @supplierIdentifier,
      supplier_document_type = NULLIF(@supplierDocumentType, ''),
      donor_national_id = @donorId,
      notes = NULLIF(@notes, ''),
      external_party = NULLIF(@externalParty, '')
    WHERE id = @DocumentIdentifier;

    SELECT @DocumentNumber = document_number
    FROM inventory_document
    WHERE id = @DocumentIdentifier;
  END;

  INSERT INTO inventory_document_line (
    document_id,
    item_id,
    source_warehouse_id,
    target_warehouse_id,
    quantity,
    unit_cost,
    supplier_document_number,
    extra_metadata
  )
  SELECT
    @DocumentIdentifier,
    item_id,
    source_warehouse_id,
    target_warehouse_id,
    quantity,
    unit_cost,
    supplier_document_number,
    CASE
      WHEN supplier_document_number IS NOT NULL
      THEN (
        SELECT
          supplier_document_number AS supplier_document_number
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
      )
      ELSE NULL
    END
  FROM @Lines;

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
    lr.item_id,
    lr.warehouse_id,
    NULL,
    @LedgerMovementType,
    lr.quantity,
    @EffectiveDocumentDate,
    CONVERT(NVARCHAR(50), @DocumentNumber),
    @createdBy,
    (
      SELECT
        @notes AS document_note,
        @supplierDocumentType AS supplier_document_type,
        @supplierIdentifier AS supplier_identifier,
        @donorId AS donor_national_id,
        @externalParty AS external_party,
        lr.unit_cost AS unit_cost,
        lr.supplier_document_number AS supplier_document_number,
        lr.direction AS movement_direction,
        lr.source_warehouse_id,
        lr.target_warehouse_id
      FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
    )
  FROM @LedgerRows lr;

  COMMIT;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK;
  DECLARE @Err NVARCHAR(4000) = ERROR_MESSAGE();
  DECLARE @Severity INT = ERROR_SEVERITY();
  DECLARE @State INT = ERROR_STATE();
  RAISERROR(@Err, @Severity, @State);
END CATCH;

SELECT
  ISNULL((SELECT TOP 1 id FROM @Inserted), @DocumentIdentifier) AS id,
  ISNULL((SELECT TOP 1 document_number FROM @Inserted), @DocumentNumber) AS document_number;
`;

type PermissionResult = {
  allowed: boolean;
  status: number;
  session: Awaited<ReturnType<typeof getSession>> | null;
};

async function ensureInventoryPermission(
  level: "read" | "write"
): Promise<PermissionResult> {
  const session = await getSession();
  if (!session?.national_id) {
    return { allowed: false, status: 401, session: null };
  }
  const allowed =
    (await hasPermission(session.role_group_code, "equipment-inventory", level)) ||
    (await hasPermission(session.role_group_code, "equipment", level));
  if (!allowed) {
    return { allowed: false, status: 403, session };
  }
  return { allowed: true, status: 200, session };
}

function normalizeLines(input: any): DocumentLinePayload[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .map<DocumentLinePayload | null>((line) => {
      if (!line) return null;
      const itemId =
        typeof line.item_id === "string" ? line.item_id.trim() : "";
      const quantity = Number(line.quantity);
      const unitCostRaw =
        typeof line.unit_cost === "number"
          ? line.unit_cost
          : typeof line.unit_cost === "string"
          ? Number(line.unit_cost)
          : null;
      const sourceWarehouse =
        typeof line.source_warehouse_id === "string" &&
        line.source_warehouse_id.trim().length
          ? line.source_warehouse_id.trim()
          : null;
      const targetWarehouse =
        typeof line.target_warehouse_id === "string" &&
        line.target_warehouse_id.trim().length
          ? line.target_warehouse_id.trim()
          : null;
      const supplierDocument =
        typeof line.supplier_document_number === "string" &&
        line.supplier_document_number.trim().length
          ? line.supplier_document_number.trim()
          : null;
      if (!itemId || Number.isNaN(quantity)) {
        return null;
      }

      const unitCost =
        unitCostRaw === null || Number.isNaN(unitCostRaw) ? null : unitCostRaw;

      return {
        item_id: itemId,
        quantity,
        unit_cost: unitCost,
        source_warehouse_id: sourceWarehouse,
        target_warehouse_id: targetWarehouse,
        supplier_document_number: supplierDocument,
      };
    })
    .filter((line): line is DocumentLinePayload => Boolean(line));
}

function normalizeAction(value: any): InventoryAction | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  return INVENTORY_ACTIONS.includes(upper as InventoryAction)
    ? (upper as InventoryAction)
    : null;
}

export async function GET(req: Request) {
  const permission = await ensureInventoryPermission("read");
  if (!permission.allowed) {
    return NextResponse.json(
      { error: "אין לך הרשאה לצפות בתעודות מלאי." },
      { status: permission.status }
    );
  }

  await ensureInventoryDocumentColumns();

  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get("id");
  const documentNumberRaw = searchParams.get("number");

  if (documentId || documentNumberRaw) {
    const detailResult = await query(
      `
        SELECT
          d.id,
          d.document_number,
          d.action_type,
          d.document_date,
          d.notes,
          d.external_party,
          d.source_warehouse_id,
          sw.name AS source_warehouse_name,
          d.target_warehouse_id,
          tw.name AS target_warehouse_name,
          d.supplier_identifier,
          s.name AS supplier_name,
          d.supplier_document_type,
          d.donor_national_id,
          don.full_name AS donor_name,
          d.created_by,
          au.full_name AS created_by_name,
          SUM(l.quantity) AS total_quantity,
          SUM(l.quantity * ISNULL(l.unit_cost, 0)) AS total_value
        FROM inventory_document d
        LEFT JOIN inventory_document_line l ON l.document_id = d.id
        LEFT JOIN warehouse sw ON sw.id = d.source_warehouse_id
        LEFT JOIN warehouse tw ON tw.id = d.target_warehouse_id
        LEFT JOIN supplier s ON s.supplier_identifier = d.supplier_identifier
        LEFT JOIN app_user au ON au.national_id = d.created_by
        LEFT JOIN donor don ON don.national_id = d.donor_national_id
        WHERE (@docId IS NULL OR d.id = @docId)
          AND (@docNumber IS NULL OR d.document_number = @docNumber)
        GROUP BY
          d.id,
          d.document_number,
          d.action_type,
          d.document_date,
          d.notes,
          d.external_party,
          d.source_warehouse_id,
          sw.name,
          d.target_warehouse_id,
          tw.name,
          d.supplier_identifier,
          s.name,
          d.supplier_document_type,
          d.donor_national_id,
          don.full_name,
          d.created_by,
          au.full_name
      `,
      {
        docId: documentId || null,
        docNumber: documentNumberRaw ? Number(documentNumberRaw) : null,
      }
    );

    if (!detailResult.recordset.length) {
      return NextResponse.json(
        { error: "התעודה שביקשת לא נמצאה." },
        { status: 404 }
      );
    }

    const detailRow = detailResult.recordset[0];

    const linesResult = await query(
      `
        SELECT
          l.id,
          l.item_id,
          ei.name AS item_name,
          ei.internal_sku,
          l.quantity,
          l.unit_cost,
          l.source_warehouse_id,
          sw.name AS source_warehouse_name,
          l.target_warehouse_id,
          tw.name AS target_warehouse_name,
          l.supplier_document_number
        FROM inventory_document_line l
        JOIN equipment_item ei ON ei.id = l.item_id
        LEFT JOIN warehouse sw ON sw.id = l.source_warehouse_id
        LEFT JOIN warehouse tw ON tw.id = l.target_warehouse_id
        WHERE l.document_id = @docId
        ORDER BY ei.name
      `,
      { docId: detailRow.id }
    );

    return NextResponse.json({
      document: {
        id: detailRow.id,
        document_number: detailRow.document_number,
        action_type: detailRow.action_type,
        document_date: detailRow.document_date,
        notes: detailRow.notes,
        external_party: detailRow.external_party,
        supplier_identifier: detailRow.supplier_identifier,
        supplier_name: detailRow.supplier_name,
          supplier_document_type: detailRow.supplier_document_type,
          donor_national_id: detailRow.donor_national_id,
          donor_name: detailRow.donor_name,
        source_warehouse_id: detailRow.source_warehouse_id,
        source_warehouse_name: detailRow.source_warehouse_name,
        target_warehouse_id: detailRow.target_warehouse_id,
        target_warehouse_name: detailRow.target_warehouse_name,
        total_quantity: Number(detailRow.total_quantity) || 0,
        total_value:
          detailRow.total_value === null || detailRow.total_value === undefined
            ? null
            : Number(detailRow.total_value),
        created_by: detailRow.created_by,
        created_by_name: detailRow.created_by_name,
        activity_id: detailRow.activity_id,
        lines: (linesResult.recordset || []).map((line: any) => ({
          id: line.id,
          item_id: line.item_id,
          item_name: line.item_name,
          internal_sku: line.internal_sku,
          quantity: Number(line.quantity) || 0,
          unit_cost:
            line.unit_cost === null || line.unit_cost === undefined
              ? null
              : Number(line.unit_cost),
          source_warehouse_id: line.source_warehouse_id,
          source_warehouse_name: line.source_warehouse_name,
          target_warehouse_id: line.target_warehouse_id,
          target_warehouse_name: line.target_warehouse_name,
          supplier_document_number: line.supplier_document_number,
        })),
      },
    });
  }

  const listResult = await query(
    `
      SELECT TOP (@limit)
        d.id,
        d.document_number,
        d.action_type,
        d.document_date,
        d.notes,
        d.external_party,
        d.supplier_identifier,
        s.name AS supplier_name,
        d.supplier_document_type,
        d.donor_national_id,
        don.full_name AS donor_name,
        d.created_by,
        au.full_name AS created_by_name,
        aggregates.total_quantity,
        aggregates.total_value,
        sourceAgg.source_warehouse_id,
        sourceAgg.source_warehouse_name,
        sourceAgg.source_count,
        targetAgg.target_warehouse_id,
        targetAgg.target_warehouse_name,
        targetAgg.target_count
      FROM inventory_document d
      JOIN (
        SELECT
          document_id,
          SUM(quantity) AS total_quantity,
          SUM(quantity * ISNULL(unit_cost, 0)) AS total_value
        FROM inventory_document_line
        GROUP BY document_id
      ) aggregates ON aggregates.document_id = d.id
      OUTER APPLY (
        SELECT TOP 1
          document_id,
          source_warehouse_id,
          w.name AS source_warehouse_name,
          COUNT(*) OVER (PARTITION BY l.document_id) AS source_count
        FROM inventory_document_line l
        LEFT JOIN warehouse w ON w.id = l.source_warehouse_id
        WHERE l.document_id = d.id AND l.source_warehouse_id IS NOT NULL
        ORDER BY l.source_warehouse_id
      ) sourceAgg
      OUTER APPLY (
        SELECT TOP 1
          document_id,
          target_warehouse_id,
          w.name AS target_warehouse_name,
          COUNT(*) OVER (PARTITION BY l.document_id) AS target_count
        FROM inventory_document_line l
        LEFT JOIN warehouse w ON w.id = l.target_warehouse_id
        WHERE l.document_id = d.id AND l.target_warehouse_id IS NOT NULL
        ORDER BY l.target_warehouse_id
      ) targetAgg
      LEFT JOIN supplier s ON s.supplier_identifier = d.supplier_identifier
      LEFT JOIN app_user au ON au.national_id = d.created_by
      LEFT JOIN donor don ON don.national_id = d.donor_national_id
      ORDER BY d.document_date DESC, d.document_number DESC
    `,
    { limit: 50 }
  );

  return NextResponse.json({
    documents: (listResult.recordset || []).map((row: any) => ({
      id: row.id,
      document_number: row.document_number,
      action_type: row.action_type,
      document_date: row.document_date,
      notes: row.notes,
      external_party: row.external_party,
      supplier_identifier: row.supplier_identifier,
      supplier_name: row.supplier_name,
      supplier_document_type: row.supplier_document_type,
      donor_national_id: row.donor_national_id,
      donor_name: row.donor_name,
      source_warehouse_id:
        row.source_count > 1 ? null : row.source_warehouse_id || null,
      source_warehouse_name:
        row.source_count > 1 ? null : row.source_warehouse_name || null,
      target_warehouse_id:
        row.target_count > 1 ? null : row.target_warehouse_id || null,
      target_warehouse_name:
        row.target_count > 1 ? null : row.target_warehouse_name || null,
      total_quantity: Number(row.total_quantity) || 0,
      total_value:
        row.total_value === null || row.total_value === undefined
          ? null
          : Number(row.total_value),
      created_by: row.created_by,
      created_by_name: row.created_by_name,
    })),
  });
}

async function saveInventoryDocument(
  req: Request,
  method: "POST" | "PUT"
) {
  const permission = await ensureInventoryPermission("write");
  if (!permission.allowed || !permission.session) {
    return NextResponse.json(
      { error: "אין לך הרשאה לבצע פעולה זו." },
      { status: permission.status }
    );
  }

  await ensureInventoryDocumentColumns();

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "מבנה הבקשה אינו תקין." },
      { status: 400 }
    );
  }

  const actionType = normalizeAction(body?.action_type);
  if (!actionType) {
    return NextResponse.json(
      { error: "סוג התעודה אינו נתמך." },
      { status: 400 }
    );
  }

  const lines = normalizeLines(body?.lines);
  if (!lines.length) {
    return NextResponse.json(
      { error: "יש להוסיף לפחות שורת תעודה אחת." },
      { status: 400 }
    );
  }

  const supplierIdentifier =
    typeof body?.supplier_identifier === "string" && body.supplier_identifier.trim()
      ? body.supplier_identifier.trim()
      : null;

  if (actionType === "RECEIPT" && !supplierIdentifier) {
    return NextResponse.json(
      { error: "בקליטת ספק יש לבחור ספק." },
      { status: 400 }
    );
  }

  const donorId =
    actionType === "DONATION" &&
    typeof body?.donor_national_id === "string" &&
    body.donor_national_id.trim().length
      ? body.donor_national_id.trim()
      : null;

  if (actionType === "DONATION" && !donorId) {
    return NextResponse.json(
      { error: "יש לבחור תורם לתעודת תרומה." },
      { status: 400 }
    );
  }

  const supplierDocumentType =
    actionType === "RECEIPT" &&
    typeof body?.supplier_document_type === "string" &&
    body.supplier_document_type.trim().length
      ? body.supplier_document_type.trim()
      : "";

  const externalParty =
    actionType === "DISPOSAL" &&
    typeof body?.external_party === "string" &&
    body.external_party.trim().length
      ? body.external_party.trim()
      : null;

  const notes =
    typeof body?.notes === "string" && body.notes.trim().length
      ? body.notes
      : null;

  const editingDocumentId =
    typeof body?.document_id === "string" && body.document_id.trim().length
      ? body.document_id.trim()
      : null;

  if (method === "POST" && editingDocumentId) {
    return NextResponse.json(
      { error: "לא ניתן לעדכן תעודה קיימת באמצעות יצירה חדשה." },
      { status: 400 }
    );
  }

  if (method === "PUT" && !editingDocumentId) {
    return NextResponse.json(
      { error: "נדרש מזהה תעודה לעדכון." },
      { status: 400 }
    );
  }

  const result = await query(SAVE_DOCUMENT_SQL, {
    actionType,
    documentDate: null,
    supplierIdentifier,
    supplierDocumentType,
    donorId,
    notes,
    externalParty,
    createdBy: permission.session.national_id,
    linesJson: JSON.stringify(lines),
    documentId: editingDocumentId,
  });

  const inserted = result.recordset?.[0];

  return NextResponse.json({
    success: true,
    document: inserted,
  });
}

export async function POST(req: Request) {
  return saveInventoryDocument(req, "POST");
}

export async function PUT(req: Request) {
  return saveInventoryDocument(req, "PUT");
}

