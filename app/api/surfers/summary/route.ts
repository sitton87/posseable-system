import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET() {
  try {
    const permission = await ensurePermissionResponse("surfers", "read");
    if (!permission.allowed) return permission.response;

    const statsResult = await query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = N'מאושר' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = N'בהמתנה' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN medical_approval = 1 THEN 1 ELSE 0 END) AS medical_approved,
        SUM(CASE WHEN needs_wheelchair = 1 THEN 1 ELSE 0 END) AS wheelchair,
        SUM(CASE WHEN group_id IS NOT NULL THEN 1 ELSE 0 END) AS grouped
      FROM surfer
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
        WHERE entity_type = @entity_type
        ORDER BY COALESCE(due_date, created_at) DESC
      `,
      { entity_type: "surfer" }
    );

    const recentActivityResult = await query(`
      SELECT TOP (8)
        s.national_id,
        s.full_name,
        s.status,
        s.program,
        s.group_id,
        g.name AS group_name,
        s.created_at,
        s.created_at AS updated_at
      FROM surfer s
      LEFT JOIN [group] g ON s.group_id = g.id
      ORDER BY s.created_at DESC
    `);

    const statsRow = statsResult.recordset?.[0] || {};

    return NextResponse.json({
      success: true,
      stats: {
        total: Number(statsRow.total || 0),
        active: Number(statsRow.active || 0),
        approved: Number(statsRow.approved || 0),
        pending: Number(statsRow.pending || 0),
        medicalApproved: Number(statsRow.medical_approved || 0),
        wheelchair: Number(statsRow.wheelchair || 0),
        grouped: Number(statsRow.grouped || 0),
      },
      tasks: tasksResult.recordset || [],
      recentActivity: recentActivityResult.recordset || [],
    });
  } catch (err: any) {
    console.error("Error fetching surfers summary:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}





