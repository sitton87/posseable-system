import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("equipment", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      id,
      name,
      description,
      condition,
      is_consumable = false,
      is_sku_tracked = true,
      min_stock,
      max_stock,
      is_rental = false,
      rental_expiry,
      manufacturer_name,
      manufacturer_sku,
      default_image_url,
      purchase_cost,
      notes,
      is_active = true,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Equipment ID is required" },
        { status: 400 }
      );
    }

    await query(
      `
        UPDATE equipment_item
        SET
          name = @name,
          description = @description,
          condition = @condition,
          is_consumable = @is_consumable,
          is_sku_tracked = @is_sku_tracked,
          min_stock = @min_stock,
          max_stock = @max_stock,
          is_rental = @is_rental,
          rental_expiry = @rental_expiry,
          manufacturer_name = @manufacturer_name,
          manufacturer_sku = @manufacturer_sku,
          default_image_url = @default_image_url,
          purchase_cost = @purchase_cost,
          notes = @notes,
          is_active = @is_active,
          updated_at = SYSUTCDATETIME()
        WHERE id = @id
      `,
      {
        id,
        name,
        description: description || null,
        condition,
        is_consumable: is_consumable ? 1 : 0,
        is_sku_tracked: is_sku_tracked ? 1 : 0,
        min_stock:
          is_sku_tracked || typeof min_stock !== "number" ? null : min_stock,
        max_stock:
          is_sku_tracked || typeof max_stock !== "number" ? null : max_stock,
        is_rental: is_rental ? 1 : 0,
        rental_expiry: rental_expiry || null,
        manufacturer_name: manufacturer_name || null,
        manufacturer_sku: manufacturer_sku || null,
        default_image_url: default_image_url || null,
        purchase_cost: purchase_cost ?? null,
        notes: notes || null,
        is_active: is_active ? 1 : 0,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating equipment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("equipment", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Equipment ID is required" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE equipment_item SET is_active = 0, updated_at = SYSUTCDATETIME() WHERE id = @id`,
      { id }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting equipment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

