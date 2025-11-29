import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const sql = `
      SELECT 
        g.id,
        g.name,
        g.description,
        g.season_id,
        g.min_participants,
        g.max_participants,
        g.current_participants,
        g.status,
        g.is_active,
        g.notes,
        g.created_at,
        g.updated_at,
        s.name as season_name,
        s.year as season_year
      FROM [groups] g
      LEFT JOIN season_plan s ON g.season_id = s.id
      ORDER BY g.created_at DESC
    `;

    const result = await query(sql);

    return NextResponse.json({
      success: true,
      groups: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching groups:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

