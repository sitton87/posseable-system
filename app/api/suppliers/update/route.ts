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
        is_active = @is_active
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

