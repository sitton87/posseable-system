import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      season_id,
      series_id,
      group_id,
      kind,
      activity_date,
      start_time,
      end_time,
      location,
      capacity,
      status,
      notes,
    } = body;

    // Validation
    if (!series_id || !kind || !activity_date) {
      return NextResponse.json(
        { error: "series_id, kind, and activity_date are required" },
        { status: 400 }
      );
    }

    const seriesResult = await query(
      `SELECT id, season_id FROM season_activity_series WHERE id = @series_id`,
      { series_id }
    );

    if (!seriesResult.recordset.length) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    const targetSeasonId = seriesResult.recordset[0].season_id;
    if (season_id && Number(season_id) !== targetSeasonId) {
      return NextResponse.json(
        { error: "series_id does not belong to the provided season_id" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO activity (
        season_id, series_id, group_id, kind, activity_date, start_time, end_time,
        location, capacity, status, notes
      )
      VALUES (
        @season_id, @series_id, @group_id, @kind, @activity_date, @start_time, @end_time,
        @location, @capacity, @status, @notes
      )
    `;

    const normalizedStatus = status || "מתוכנן";

    await query(sql, {
      season_id: targetSeasonId,
      series_id,
      group_id,
      kind,
      activity_date,
      start_time,
      end_time,
      location,
      capacity,
      status: normalizedStatus,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding activity:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

