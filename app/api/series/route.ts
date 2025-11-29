import { NextResponse } from "next/server";
import { query } from "@/db/connection";

type SeriesRow = {
  id: number;
  season_id: number;
  name: string;
  description?: string | null;
  status?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  lead_national_id?: string | null;
  lead_name?: string | null;
  notes?: string | null;
  is_default: boolean;
  created_at: string;
  season_name?: string;
  season_year?: number;
  activities_count?: number;
  activities?: any[];
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonIdParam =
      searchParams.get("season_id") ?? searchParams.get("seasonId");
    const includeActivities =
      searchParams.get("includeActivities") === "true" ||
      searchParams.get("withActivities") === "true";
    const includeStats =
      includeActivities || searchParams.get("withStats") === "true";

    const params: Record<string, any> = {};

    let selectClause = `
      SELECT
        sas.id,
        sas.season_id,
        sas.name,
        sas.description,
        sas.status,
        sas.start_date,
        sas.end_date,
        sas.lead_national_id,
        sas.notes,
        sas.is_default,
        sas.created_at,
        sp.name AS season_name,
        sp.year AS season_year
    `;

    if (includeStats) {
      selectClause += `,
        COALESCE(stats.activities_count, 0) AS activities_count
      `;
    } else {
      selectClause += `,
        NULL AS activities_count
      `;
    }

    let sql = `
      ${selectClause}
      FROM season_activity_series sas
      INNER JOIN season_plan sp ON sp.id = sas.season_id
    `;

    if (includeStats) {
      sql += `
        OUTER APPLY (
          SELECT COUNT(*) AS activities_count
          FROM activity a
          WHERE a.series_id = sas.id
        ) stats
      `;
    }

    sql += " WHERE 1=1";

    if (seasonIdParam) {
      sql += " AND sas.season_id = @season_id";
      params.season_id = Number(seasonIdParam);
    }

    sql += `
      ORDER BY sp.year DESC, COALESCE(sas.start_date, sp.start_date) DESC, sas.created_at DESC
    `;

    const seriesResult = await query(sql, params);
    let series: SeriesRow[] = seriesResult.recordset;

    if (includeActivities && series.length) {
      const activitiesParams: Record<string, any> = {};
      const placeholders = series.map((s, idx) => {
        const key = `series_id_${idx}`;
        activitiesParams[key] = s.id;
        return `@${key}`;
      });

      const activitiesSql = `
        SELECT
          a.id,
          a.season_id,
          a.series_id,
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
          g.name AS group_name,
          sas.name AS series_name,
          stats.participant_count,
          lead_info.lead_national_id,
          lead_info.lead_name
        FROM activity a
        INNER JOIN season_activity_series sas ON sas.id = a.series_id
        LEFT JOIN [group] g ON a.group_id = g.id
        OUTER APPLY (
          SELECT COUNT(*) AS participant_count
          FROM registration r
          WHERE r.activity_id = a.id
        ) stats
        OUTER APPLY (
          SELECT TOP 1
            av.volunteer_national_id AS lead_national_id,
            v.full_name AS lead_name
          FROM activity_volunteer av
          INNER JOIN volunteer v ON v.national_id = av.volunteer_national_id
          WHERE av.activity_id = a.id AND av.is_lead = 1
          ORDER BY av.assigned_at DESC
        ) lead_info
        WHERE a.series_id IN (${placeholders.join(",")})
        ORDER BY a.activity_date DESC, a.start_time DESC
      `;

      const activitiesResult = await query(activitiesSql, activitiesParams);
      const activitiesBySeries: Record<number, any[]> = {};

      activitiesResult.recordset.forEach((activity) => {
        if (!activitiesBySeries[activity.series_id]) {
          activitiesBySeries[activity.series_id] = [];
        }
        activitiesBySeries[activity.series_id].push(activity);
      });

      series = series.map((s) => ({
        ...s,
        activities: activitiesBySeries[s.id] || [],
        activities_count: activitiesBySeries[s.id]
          ? activitiesBySeries[s.id].length
          : s.activities_count ?? 0,
      }));
    }

    return NextResponse.json({
      success: true,
      series,
    });
  } catch (err: any) {
    console.error("Error fetching activity series:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

