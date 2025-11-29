import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
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

    if (!id) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE activity
      SET
        season_id = @season_id,
        group_id = @group_id,
        kind = @kind,
        activity_date = @activity_date,
        start_time = @start_time,
        end_time = @end_time,
        location = @location,
        capacity = @capacity,
        status = @status,
        notes = @notes
      WHERE id = @id
    `;

    await query(sql, {
      id,
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
    console.error("Error updating activity:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
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

