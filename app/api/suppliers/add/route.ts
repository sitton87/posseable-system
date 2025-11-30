import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
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

    if (!supplier_identifier || !identifier_type || !name) {
      return NextResponse.json(
        { error: "Supplier identifier, identifier type and name are required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO supplier (
        supplier_identifier,
        identifier_type,
        name,
        contact_name,
        phone,
        email,
        notes,
        is_active,
        created_at
      )
      VALUES (
        @supplier_identifier,
        @identifier_type,
        @name,
        @contact_name,
        @phone,
        @email,
        @notes,
        @is_active,
        GETDATE()
      )
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
    console.error("Error adding supplier:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

