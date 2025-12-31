import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "read");
    if (!permission.allowed) return permission.response;

    const sql = `
      SELECT
        SUM(CASE WHEN status IN ('Planned', 'מתוכנן') THEN 1 ELSE 0 END) as planned,
        SUM(CASE WHEN status IN ('Completed', 'הושלם') THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('Cancelled', 'בוטל') THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN activity_date >= CAST(GETDATE() AS DATE) 
                  AND activity_date < DATEADD(day, 7, CAST(GETDATE() AS DATE)) 
                  AND status != 'Cancelled'
             THEN 1 ELSE 0 END) as this_week,
        SUM(CASE WHEN activity_date > CAST(GETDATE() AS DATE) 
                  AND status != 'Cancelled'
             THEN 1 ELSE 0 END) as future
      FROM activity
    `;

    const result = await query(sql);
    const row = result.recordset[0];

    return NextResponse.json({
      success: true,
      stats: {
        planned: row.planned || 0,
        completed: row.completed || 0,
        cancelled: row.cancelled || 0,
        thisWeek: row.this_week || 0,
        future: row.future || 0,
      },
    });
  } catch (err: any) {
    console.error("Error fetching activity stats:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

