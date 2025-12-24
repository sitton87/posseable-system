import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      id,
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
      activity_manager_id,
      safety_manager_id,
      sea_condition,
      weather_notes,
      summary_general,
      summary_preserve,
      summary_improve,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    if (!series_id) {
      return NextResponse.json(
        { error: "series_id is required" },
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
      UPDATE activity
      SET
        season_id = @season_id,
        series_id = @series_id,
        group_id = @group_id,
        kind = @kind,
        activity_date = @activity_date,
        start_time = @start_time,
        end_time = @end_time,
        location = @location,
        capacity = @capacity,
        status = @status,
        notes = @notes,
        activity_manager_id = @activity_manager_id,
        safety_manager_id = @safety_manager_id,
        sea_condition = @sea_condition,
        weather_notes = @weather_notes,
        summary_general = @summary_general,
        summary_preserve = @summary_preserve,
        summary_improve = @summary_improve
      WHERE id = @id
    `;

    await query(sql, {
      id,
      season_id: targetSeasonId,
      series_id,
      group_id,
      kind,
      activity_date,
      start_time,
      end_time,
      location,
      capacity,
      status: status || "מתוכנן",
      notes,
      activity_manager_id,
      safety_manager_id,
      sea_condition,
      weather_notes,
      summary_general,
      summary_preserve,
      summary_improve,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating activity:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    const sql = `DELETE FROM activity WHERE id = @id`;
    await query(sql, { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting activity:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

