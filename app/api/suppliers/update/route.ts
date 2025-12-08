import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("suppliers", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      supplier_identifier,
      identifier_type,
      name,
      contact_name,
      phone,
      email,
      notes,
      is_active,
      supplier_type,
      services_offered,
      has_active_contract,
    } = body;

    if (!supplier_identifier) {
      return NextResponse.json(
        { error: "Supplier identifier is required" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE supplier
      SET
        identifier_type = @identifier_type,
        name = @name,
        contact_name = @contact_name,
        phone = @phone,
        email = @email,
        notes = @notes,
        is_active = @is_active,
        supplier_type = COALESCE(@supplier_type, supplier_type),
        services_offered = @services_offered,
        has_active_contract = COALESCE(@has_active_contract, has_active_contract)
      WHERE supplier_identifier = @supplier_identifier
    `;

    await query(sql, {
      supplier_identifier,
      identifier_type,
      name,
      contact_name,
      phone,
      email,
      notes,
      is_active: is_active ? 1 : 0,
      supplier_type,
      services_offered,
      has_active_contract:
        typeof has_active_contract === "boolean"
          ? has_active_contract
            ? 1
            : 0
          : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating supplier:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("suppliers", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const supplier_identifier = searchParams.get("supplier_identifier");

    if (!supplier_identifier) {
      return NextResponse.json(
        { error: "Supplier identifier is required" },
        { status: 400 }
      );
    }

    const sql = `UPDATE supplier SET is_active = 0 WHERE supplier_identifier = @supplier_identifier`;
    await query(sql, { supplier_identifier });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting supplier:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

