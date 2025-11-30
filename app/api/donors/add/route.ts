import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
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

    // Validation
    if (!national_id || !/^\d{9}$/.test(national_id)) {
      return NextResponse.json(
        { error: "תעודת זהות חייבת להכיל 9 ספרות" },
        { status: 400 }
      );
    }

    if (!full_name || !full_name.trim()) {
      return NextResponse.json(
        { error: "שם התורם הוא שדה חובה" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO donor (
        national_id,
        full_name,
        organization,
        phone,
        email,
        notes,
        is_active,
        created_at
      )
      VALUES (
        @national_id,
        @full_name,
        @organization,
        @phone,
        @email,
        @notes,
        @is_active,
        SYSUTCDATETIME()
      )
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
    console.error("Error adding donor:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
