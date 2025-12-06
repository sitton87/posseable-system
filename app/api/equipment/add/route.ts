import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";
import { ensureEquipmentExtendedColumns } from "../helpers";

type EquipmentPayload = {
  family_code: string;
  category_code: string;
  name: string;
  description?: string | null;
  condition: string;
  is_consumable?: boolean;
  is_sku_tracked?: boolean;
  min_stock?: number | null;
  is_rental?: boolean;
  rental_expiry?: string | null;
  manufacturer_name?: string | null;
  manufacturer_sku?: string | null;
  default_image_url?: string | null;
  purchase_cost?: number | null;
  notes?: string | null;
  equipment_type?: string;
  ownership_type?: "item" | "rental" | "consignment";
  supplier_identifier?: string | null;
};

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("equipment", "write");
    if (!permission.allowed) return permission.response;
    await ensureEquipmentExtendedColumns();

    const body: EquipmentPayload = await req.json();
    const {
      family_code,
      category_code,
      name,
      description,
      condition,
      is_consumable = false,
      is_sku_tracked = true,
      min_stock,
      is_rental = false,
      rental_expiry,
      manufacturer_name,
      manufacturer_sku,
      default_image_url,
      purchase_cost,
      notes,
      equipment_type,
      ownership_type,
      supplier_identifier,
    } = body;

    const normalizedOwnership: "item" | "rental" | "consignment" =
      ownership_type === "rental"
        ? "rental"
        : ownership_type === "consignment"
        ? "consignment"
        : "item";
    const resolvedIsRental = normalizedOwnership === "rental";
    const resolvedIsConsumable =
      normalizedOwnership === "rental" ? false : is_consumable;
    const normalizedSupplierIdentifier =
      supplier_identifier && supplier_identifier.trim().length
        ? supplier_identifier.trim()
        : null;

    if (!family_code || family_code.length !== 2) {
      return NextResponse.json(
        { error: "קוד משפחה נדרש (2 תווים)" },
        { status: 400 }
      );
    }

    if (!category_code || category_code.length !== 2) {
      return NextResponse.json(
        { error: "קוד קטגוריה נדרש (2 תווים)" },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "שם הציוד הוא שדה חובה" },
        { status: 400 }
      );
    }

    const familyResult = await query(
      `
        SELECT TOP 1
          code,
          name,
          equipment_type
        FROM equipment_family
        WHERE code = @family_code
      `,
      { family_code }
    );

    if (familyResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "משפחה לא נמצאה במערכת" },
        { status: 400 }
      );
    }

    const categoryResult = await query(
      `
        SELECT TOP 1 code
        FROM equipment_category
        WHERE family_code = @family_code AND code = @category_code
      `,
      { family_code, category_code }
    );

    if (categoryResult.recordset.length === 0) {
      return NextResponse.json(
        { error: "קטגוריה לא קיימת במשפחה שנבחרה" },
        { status: 400 }
      );
    }

    const serialResult = await query(
      `
        SELECT ISNULL(MAX(serial_number), 0) + 1 AS next_serial
        FROM equipment_item
      `
    );

    const nextSerial = serialResult.recordset[0]?.next_serial ?? 1;
    if (nextSerial > 9999) {
      return NextResponse.json(
        { error: "חרגת ממספר פריטים מותר (9999)" },
        { status: 400 }
      );
    }

    const serial_number = nextSerial;
    const internal_sku = `${family_code}${category_code}${String(
      serial_number
    ).padStart(3, "0")}`;

    const resolvedEquipmentType =
      equipment_type || familyResult.recordset[0].equipment_type;

    const internalSkuMeta = await query(
      `
        SELECT COLUMNPROPERTY(
          OBJECT_ID('dbo.equipment_item'),
          'internal_sku',
          'IsComputed'
        ) AS is_computed
      `
    );

    const isInternalSkuComputed =
      internalSkuMeta.recordset?.[0]?.is_computed === 1;
    const newItemId = randomUUID();

    await query(
      `
        INSERT INTO equipment_item (
          id,
          family_code,
          category_code,
          serial_number,
          manufacturer_sku,
          name,
          description,
          equipment_type,
          condition,
          is_consumable,
          is_sku_tracked,
          min_stock,
          is_rental,
          rental_expiry,
          ownership_type,
          supplier_identifier,
          manufacturer_name,
          default_image_url,
          purchase_cost,
          notes,
          is_active,
          created_at,
          updated_at
        )
        VALUES (
          @id,
          @family_code,
          @category_code,
          @serial_number,
          @manufacturer_sku,
          @name,
          @description,
          @equipment_type,
          @condition,
          @is_consumable,
          @is_sku_tracked,
          @min_stock,
          @is_rental,
          @rental_expiry,
          @ownership_type,
          @supplier_identifier,
          @manufacturer_name,
          @default_image_url,
          @purchase_cost,
          @notes,
          1,
          SYSUTCDATETIME(),
          SYSUTCDATETIME()
        )
      `,
      {
        id: newItemId,
        family_code,
        category_code,
        serial_number,
        manufacturer_sku: manufacturer_sku || null,
        name: name.trim(),
        description: description || null,
        equipment_type: resolvedEquipmentType,
        condition,
        is_consumable: resolvedIsConsumable ? 1 : 0,
        is_sku_tracked: is_sku_tracked ? 1 : 0,
        min_stock:
          is_sku_tracked || typeof min_stock !== "number" ? null : min_stock,
        is_rental: resolvedIsRental ? 1 : 0,
        rental_expiry: resolvedIsRental ? rental_expiry || null : null,
        ownership_type: normalizedOwnership,
        supplier_identifier: normalizedSupplierIdentifier,
        manufacturer_name: manufacturer_name || null,
        default_image_url: default_image_url || null,
        purchase_cost: purchase_cost ?? null,
        notes: notes || null,
      }
    );

    if (!isInternalSkuComputed) {
      await query(
        `
          UPDATE equipment_item
          SET internal_sku = @internal_sku
          WHERE id = @id
        `,
        { id: newItemId, internal_sku }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding equipment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
