import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      season_id,
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
    if (!season_id || !kind || !activity_date) {
      return NextResponse.json(
        { error: "season_id, kind, and activity_date are required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO activity (
        season_id, group_id, kind, activity_date, start_time, end_time,
        location, capacity, status, notes
      )
      VALUES (
        @season_id, @group_id, @kind, @activity_date, @start_time, @end_time,
        @location, @capacity, @status, @notes
      )
    `;

    await query(sql, {
      season_id,
      group_id,
      kind,
      activity_date,
      start_time,
      end_time,
      location,
      capacity,
      status,
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

