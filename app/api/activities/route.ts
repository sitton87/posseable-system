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

    let sql = `
      SELECT
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
        (
          SELECT COUNT(*)
          FROM registration r
          WHERE r.activity_id = a.id
        ) AS participant_count,
        lead_info.lead_national_id,
        lead_info.lead_name,
        vm.full_name AS activity_manager_name,
        vs.full_name AS safety_manager_name
      FROM activity a
      LEFT JOIN season_activity_series sas ON sas.id = a.series_id
      LEFT JOIN [group] g ON a.group_id = g.id
      LEFT JOIN volunteer vm ON a.activity_manager_id = vm.national_id
      LEFT JOIN volunteer vs ON a.safety_manager_id = vs.national_id
      OUTER APPLY (
        SELECT TOP 1
          av.volunteer_national_id AS lead_national_id,
          v.full_name AS lead_name
        FROM activity_volunteer av
        INNER JOIN volunteer v ON v.national_id = av.volunteer_national_id
        WHERE av.activity_id = a.id AND av.is_lead = 1
        ORDER BY av.assigned_at DESC
      ) AS lead_info
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

