import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensureEquipmentExtendedColumns } from "./helpers";

type EquipmentRecord = {
  id: string;
  family_code: string;
  family_name?: string;
  category_code: string;
  category_name?: string;
  serial_number: number;
  internal_sku?: string | null;
  manufacturer_sku?: string | null;
  name: string;
  description?: string | null;
  equipment_type: string;
  condition: string;
  is_consumable: boolean;
  is_sku_tracked: boolean;
  min_stock?: number | null;
  is_rental: boolean;
  rental_expiry?: string | null;
  ownership_type?: string | null;
  manufacturer_name?: string | null;
  supplier_identifier?: string | null;
  supplier_name?: string | null;
  default_image_url?: string | null;
  purchase_cost?: number | null;
  notes?: string | null;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  warehouse_stock_json?: string | null;
  media_json?: string | null;
};

export async function GET(req: Request) {
  try {
    await ensureEquipmentExtendedColumns();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const family = searchParams.get("family");
    const category = searchParams.get("category");
    const equipmentType = searchParams.get("type");
    const condition = searchParams.get("condition");
    const status = searchParams.get("status") ?? "active";

    let sql = `
      SELECT
        ei.id,
        ei.family_code,
        f.name AS family_name,
        ei.category_code,
        c.name AS category_name,
        ei.serial_number,
        ei.internal_sku,
        ei.manufacturer_sku,
        ei.name,
        ei.description,
        ei.equipment_type,
        ei.condition,
        ei.is_consumable,
        ei.is_sku_tracked,
        ei.min_stock,
        ei.is_rental,
        ei.rental_expiry,
        ei.ownership_type,
        ei.manufacturer_name,
        ei.supplier_identifier,
        s.name AS supplier_name,
        ei.default_image_url,
        ei.purchase_cost,
        ei.notes,
        ei.is_active,
        ei.created_at,
        ei.updated_at,
        (
          SELECT
            es.quantity,
            w.id   AS warehouse_id,
            w.name AS warehouse_name,
            w.code AS warehouse_code
          FROM equipment_stock es
          JOIN warehouse w ON w.id = es.warehouse_id
          WHERE es.item_id = ei.id
          FOR JSON PATH
        ) AS warehouse_stock_json,
        (
          SELECT
            media.id,
            media.file_url,
            media.caption,
            media.is_primary
          FROM equipment_item_media media
          WHERE media.item_id = ei.id
          FOR JSON PATH
        ) AS media_json
      FROM equipment_item ei
      LEFT JOIN equipment_family f
        ON f.code = ei.family_code
      LEFT JOIN equipment_category c
        ON c.family_code = ei.family_code AND c.code = ei.category_code
      LEFT JOIN supplier s
        ON s.supplier_identifier = ei.supplier_identifier
      WHERE 1 = 1
    `;

    const params: Record<string, any> = {};

    if (status === "active") {
      sql += " AND ei.is_active = 1";
    } else if (status === "inactive") {
      sql += " AND ei.is_active = 0";
    }

    if (family) {
      sql += " AND ei.family_code = @family";
      params.family = family;
    }

    if (category) {
      sql += " AND ei.category_code = @category";
      params.category = category;
    }

    if (equipmentType) {
      sql += " AND ei.equipment_type = @equipmentType";
      params.equipmentType = equipmentType;
    }

    if (condition) {
      sql += " AND ei.condition = @condition";
      params.condition = condition;
    }

    if (search) {
      sql += `
        AND (
          ei.name LIKE @search OR
          ei.internal_sku LIKE @search OR
          ei.manufacturer_sku LIKE @search OR
          ei.manufacturer_name LIKE @search
        )
      `;
      params.search = `%${search}%`;
    }

    sql += " ORDER BY ei.created_at DESC";

    const [
      itemsResult,
      familiesResult,
      categoriesResult,
      warehousesResult,
      suppliersResult,
      donorsResult,
    ] =
      await Promise.all([
      query(sql, params),
      query(`
        SELECT
          code,
          name,
          description,
          equipment_type,
          allow_item_images,
          allow_consumables,
          is_active
        FROM equipment_family
        ORDER BY name ASC
      `),
      query(`
        SELECT
          family_code,
          code,
          name,
          description,
          enforce_sku,
          require_image,
          is_active
        FROM equipment_category
        ORDER BY family_code, name
      `),
      query(`
        SELECT
          w.id,
          w.code,
          w.name,
          w.city,
          w.address_line,
          w.postal_code,
          w.manager_name,
          w.manager_phone,
          w.manager_email,
          w.contact_name,
          w.contact_phone,
          w.rent_cost,
          w.rent_currency,
          w.rent_expiry,
          w.lease_notes,
          w.general_notes,
          w.is_active,
          w.created_at,
          w.updated_at,
          SUM(COALESCE(es.quantity, 0) * COALESCE(ei.purchase_cost, 0)) AS total_value
        FROM warehouse w
        LEFT JOIN equipment_stock es
          ON es.warehouse_id = w.id
        LEFT JOIN equipment_item ei
          ON ei.id = es.item_id
        GROUP BY
          w.id,
          w.code,
          w.name,
          w.city,
          w.address_line,
          w.postal_code,
          w.manager_name,
          w.manager_phone,
          w.manager_email,
          w.contact_name,
          w.contact_phone,
          w.rent_cost,
          w.rent_currency,
          w.rent_expiry,
          w.lease_notes,
          w.general_notes,
          w.is_active,
          w.created_at,
          w.updated_at
        ORDER BY w.name
      `),
      query(`
        SELECT
          supplier_identifier,
          identifier_type,
          name,
          contact_name,
          phone,
          email,
          notes,
          is_active
        FROM supplier
        ORDER BY name
      `),
      query(`
        SELECT
          national_id,
          full_name,
          organization,
          phone,
          email,
          notes,
          is_active,
          created_at
        FROM donor
        WHERE is_active = 1
        ORDER BY full_name
      `),
    ]);

    const items = (itemsResult.recordset as EquipmentRecord[]).map((record) => {
      const warehouseStock = record.warehouse_stock_json
        ? JSON.parse(record.warehouse_stock_json)
        : [];
      const media = record.media_json ? JSON.parse(record.media_json) : [];
      const totalUnits = warehouseStock.reduce(
        (sum: number, row: { quantity: number }) => sum + Number(row.quantity || 0),
        0
      );

      const { warehouse_stock_json, media_json, ...rest } = record;

      return {
        ...rest,
        warehouse_stock: warehouseStock,
        media,
        total_units: totalUnits,
      };
    });

    return NextResponse.json({
      success: true,
      items,
      families: familiesResult.recordset,
      categories: categoriesResult.recordset,
      warehouses: warehousesResult.recordset,
      suppliers: suppliersResult.recordset,
      donors: donorsResult.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching equipment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

