import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get("kind");
    const status = searchParams.get("status");
    const seasonId = searchParams.get("season_id");
    const seriesId = searchParams.get("series_id");

    const sort = searchParams.get("sort"); // date_asc, date_desc
    const limit = Number(searchParams.get("limit")) || 100;

    let sql = `
      WITH ParticipantCounts AS (
        SELECT activity_id, COUNT(*) as count
        FROM registration WITH (NOLOCK)
        GROUP BY activity_id
      ),
      LeadVolunteers AS (
        SELECT 
            av.activity_id,
            av.volunteer_national_id,
            v.full_name,
            ROW_NUMBER() OVER (PARTITION BY av.activity_id ORDER BY av.assigned_at DESC) as rn
        FROM activity_volunteer av WITH (NOLOCK)
        INNER JOIN volunteer v WITH (NOLOCK) ON v.national_id = av.volunteer_national_id
        WHERE av.is_lead = 1
      )
      SELECT TOP (@limit)
        a.id,
        a.season_id,
        a.series_id,
        a.group_id,
        a.kind,
        a.activity_date,
        CONVERT(varchar(5), a.start_time, 108) as start_time,
        CONVERT(varchar(5), a.end_time, 108) as end_time,
        a.location,
        a.capacity,
        a.status,
        a.notes,
        a.created_at,
        a.activity_manager_id,
        a.safety_manager_id,
        a.sea_condition,
        a.weather_notes,
        a.summary_general,
        a.summary_preserve,
        a.summary_improve,
        g.name as group_name,
        sas.name as series_name,
        ISNULL(pc.count, 0) AS participant_count,
        lv.volunteer_national_id as lead_national_id,
        lv.full_name as lead_name,
        vm.full_name AS activity_manager_name,
        vs.full_name AS safety_manager_name
      FROM activity a WITH (NOLOCK)
      LEFT JOIN season_activity_series sas WITH (NOLOCK) ON sas.id = a.series_id
      LEFT JOIN [group] g WITH (NOLOCK) ON a.group_id = g.id
      LEFT JOIN volunteer vm WITH (NOLOCK) ON a.activity_manager_id = vm.national_id
      LEFT JOIN volunteer vs WITH (NOLOCK) ON a.safety_manager_id = vs.national_id
      LEFT JOIN ParticipantCounts pc ON pc.activity_id = a.id
      LEFT JOIN LeadVolunteers lv ON lv.activity_id = a.id AND lv.rn = 1
      WHERE 1=1
    `;

    const params: any = { limit };

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

    if (seasonId) {
      sql += " AND a.season_id = @season_id";
      params.season_id = Number(seasonId);
    }

    if (seriesId) {
      sql += " AND a.series_id = @series_id";
      params.series_id = Number(seriesId);
    }

    if (sort === "date_asc") {
        sql += " ORDER BY a.activity_date ASC, a.start_time ASC";
    } else {
        sql += " ORDER BY a.activity_date DESC, a.start_time DESC";
    }

    sql += " OPTION (RECOMPILE)";

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

