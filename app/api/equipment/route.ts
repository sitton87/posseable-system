import { NextResponse } from "next/server";
import { query } from "@/db/connection";

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
  max_stock?: number | null;
  is_rental: boolean;
  rental_expiry?: string | null;
  manufacturer_name?: string | null;
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
        ei.max_stock,
        ei.is_rental,
        ei.rental_expiry,
        ei.manufacturer_name,
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

    const [itemsResult, familiesResult, categoriesResult, warehousesResult] = await Promise.all([
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
          id,
          code,
          name,
          city,
          address_line,
          postal_code,
          manager_name,
          manager_phone,
          manager_email,
          contact_name,
          contact_phone,
          rent_cost,
          rent_currency,
          rent_expiry,
          lease_notes,
          general_notes,
          is_active,
          created_at,
          updated_at
        FROM warehouse
        ORDER BY name
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
    });
  } catch (err: any) {
    console.error("Error fetching equipment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

