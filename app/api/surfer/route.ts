import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(req: Request) {
  try {
    const permission = await ensurePermissionResponse("surfers", "read");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active");
    const program = searchParams.get("program");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let sql = `
      SELECT
        s.national_id,
        s.full_name,
        s.phone,
        s.email,
        s.residence,
        s.age,
        s.date_of_birth,
        s.gender,
        s.status,
        s.program,
        s.group_id,
        g.name AS group_name,
        s.medical_approval,
        s.medical_condition,
        s.needs_wheelchair,
        s.volunteers_needed,
        s.special_requirements,
        s.emergency_contact_name,
        s.emergency_contact_phone,
        s.active,
        s.notes,
        s.created_at
      FROM surfer s
      LEFT JOIN [group] g ON s.group_id = g.id
      WHERE 1=1
    `;

    const params: any = {};

    if (activeOnly === "true") {
      sql += " AND s.active = 1";
    } else if (activeOnly === "false") {
      sql += " AND s.active = 0";
    }

    if (program) {
      sql += " AND s.program = @program";
      params.program = program;
    }

    if (status) {
      sql += " AND s.status = @status";
      params.status = status;
    }

    if (search) {
      sql += ` AND (
        s.full_name LIKE @search OR
        s.national_id LIKE @search OR
        s.phone LIKE @search OR
        s.email LIKE @search
      )`;
      params.search = `%${search}%`;
    }

    sql += " ORDER BY s.created_at DESC";

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      surfers: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching surfers:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
