import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET() {
  try {
    const permission = await ensurePermissionResponse("volunteers", "read");
    if (!permission.allowed) return permission.response;

    // Note: The 'volunteer' table currently does not have 'status' or 'group_id' columns in the schema.
    // We are approximating stats based on 'active' status.
    const statsResult = await query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS approved,
        0 AS pending,
        0 AS grouped
      FROM volunteer
    `);

    const tasksResult = await query(
      `
        SELECT TOP (8)
          note_id,
          entity_id,
          title,
          body,
          status,
          priority,
          due_date,
          created_by,
          created_at,
          updated_at
        FROM note
        WHERE entity_type = 'volunteer'
        ORDER BY COALESCE(due_date, created_at) DESC
      `
    );

    const recentActivityResult = await query(`
      SELECT TOP (8)
        national_id,
        full_name,
        CASE WHEN active = 1 THEN N'פעיל' ELSE N'לא פעיל' END as status,
        kind as program,
        NULL as group_name,
        created_at
      FROM volunteer
      ORDER BY created_at DESC
    `);

    const statsRow = statsResult.recordset?.[0] || {};

    return NextResponse.json({
      success: true,
      stats: {
        total: Number(statsRow.total || 0),
        active: Number(statsRow.active || 0),
        approved: Number(statsRow.approved || 0),
        pending: Number(statsRow.pending || 0),
        grouped: Number(statsRow.grouped || 0),
      },
      tasks: tasksResult.recordset || [],
      recentActivity: recentActivityResult.recordset || [],
    });
  } catch (err: any) {
    console.error("Error fetching volunteer summary:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

