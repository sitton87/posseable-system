import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeSurfers = searchParams.get("includeSurfers") === "true";

    const sql = `
      SELECT 
        g.id,
        g.name,
        g.description,
        g.season_id,
        g.start_season_id,
        g.additional_seasons,
        g.min_participants,
        g.max_participants,
        (SELECT COUNT(*) FROM surfer WHERE group_id = CAST(g.id AS NVARCHAR(50))) as current_participants,
        g.status,
        g.is_active,
        g.notes,
        g.created_at,
        g.updated_at,
        s.name as season_name,
        s.year as season_year
      FROM [group] g
      LEFT JOIN season_plan s ON g.season_id = s.id
      WHERE g.is_deleted = 0
      ORDER BY g.created_at DESC
    `;

    const result = await query(sql);
    let groups: any[] = result.recordset;

    if (includeSurfers) {
      const surfersResult = await query(`
        SELECT
          national_id,
          full_name,
          phone,
          email,
          status,
          group_id
        FROM surfer
        WHERE group_id IS NOT NULL
      `);

      const surfersByGroup = surfersResult.recordset.reduce(
        (acc: Record<string, any[]>, surfer: any) => {
          if (!surfer.group_id) return acc;
          const key = String(surfer.group_id).toLowerCase();
          const list = acc[key] || [];
          list.push(surfer);
          acc[key] = list;
          return acc;
        },
        {}
      );

      groups = groups.map((group: any) => {
        const key = String(group.id).toLowerCase();
        return {
          ...group,
          surfers: surfersByGroup[key] || [],
        };
      });
    }

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (err: any) {
    console.error("Error fetching groups:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

