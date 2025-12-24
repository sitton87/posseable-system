import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activity_id = searchParams.get("activity_id");

    if (!activity_id) {
      return NextResponse.json({ error: "activity_id is required" }, { status: 400 });
    }

    const sql = `
      SELECT av.activity_id, av.volunteer_national_id, av.role_id, r.name as role_name, v.full_name as volunteer_name
      FROM activity_volunteer av
      JOIN volunteer v ON v.national_id = av.volunteer_national_id
      LEFT JOIN role r ON r.id = av.role_id
      WHERE av.activity_id = @activity_id
    `;

    const result = await query(sql, { activity_id });
    return NextResponse.json({ success: true, roles: result.recordset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const { activity_id, volunteer_id, role_id } = body;

    if (!activity_id || !volunteer_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if exists
    const check = await query(
      "SELECT * FROM activity_volunteer WHERE activity_id = @activity_id AND volunteer_national_id = @volunteer_id",
      { activity_id, volunteer_id }
    );

    if (check.recordset.length > 0) {
      // Update
      await query(
        "UPDATE activity_volunteer SET role_id = @role_id WHERE activity_id = @activity_id AND volunteer_national_id = @volunteer_id",
        { activity_id, volunteer_id, role_id: role_id || null }
      );
    } else {
      // Insert
      await query(
        "INSERT INTO activity_volunteer (activity_id, volunteer_national_id, role_id, is_lead, assigned_at) VALUES (@activity_id, @volunteer_id, @role_id, 0, sysdatetime())",
        { activity_id, volunteer_id, role_id: role_id || null }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const activity_id = searchParams.get("activity_id");
    const volunteer_id = searchParams.get("volunteer_id");

    if (!activity_id || !volunteer_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await query(
      "DELETE FROM activity_volunteer WHERE activity_id = @activity_id AND volunteer_national_id = @volunteer_id",
      { activity_id, volunteer_id }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
