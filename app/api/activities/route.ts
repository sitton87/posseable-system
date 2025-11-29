import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get("kind");
    const status = searchParams.get("status");

    let sql = `
      SELECT
        a.id,
        a.season_id,
        a.group_id,
        a.kind,
        a.activity_date,
        a.start_time,
        a.end_time,
        a.location,
        a.capacity,
        a.status,
        a.notes,
        a.created_at,
        g.name as group_name
      FROM activity a
      LEFT JOIN [groups] g ON a.group_id = g.id
      WHERE 1=1
    `;

    const params: any = {};

    // Filter by kind
    if (kind) {
      sql += " AND a.kind = @kind";
      params.kind = kind;
    }

    // Filter by status
    if (status) {
      sql += " AND a.status = @status";
      params.status = status;
    }

    sql += " ORDER BY a.activity_date DESC, a.start_time DESC";

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      activities: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching activities:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

