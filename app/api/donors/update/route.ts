import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("donors", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      national_id,
      full_name,
      organization,
      phone,
      email,
      notes,
      is_active,
    } = body;

    if (!national_id) {
      return NextResponse.json(
        { error: "תעודת זהות נדרשת" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE donor
      SET
        full_name = @full_name,
        organization = @organization,
        phone = @phone,
        email = @email,
        notes = @notes,
        is_active = @is_active
      WHERE national_id = @national_id
    `;

    await query(sql, {
      national_id,
      full_name,
      organization: organization || null,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      is_active: is_active ? 1 : 0,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating donor:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("donors", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const national_id = searchParams.get("national_id");

    if (!national_id) {
      return NextResponse.json(
        { error: "תעודת זהות נדרשת" },
        { status: 400 }
      );
    }

    const sql = `UPDATE donor SET is_active = 0 WHERE national_id = @national_id`;
    await query(sql, { national_id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting donor:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

