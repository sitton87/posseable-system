import { query } from "@/db/connection";

let equipmentColumnsEnsured = false;

export async function ensureEquipmentExtendedColumns() {
  if (equipmentColumnsEnsured) return;
  await query(`
    IF COL_LENGTH('dbo.equipment_item', 'ownership_type') IS NULL
    BEGIN
      ALTER TABLE dbo.equipment_item ADD ownership_type NVARCHAR(20) NULL;
    END
  `);
  await query(`
    IF COL_LENGTH('dbo.equipment_item', 'supplier_identifier') IS NULL
    BEGIN
      ALTER TABLE dbo.equipment_item ADD supplier_identifier VARCHAR(20) NULL;
    END
  `);
  equipmentColumnsEnsured = true;
}

