import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      season_id,
      min_participants,
      max_participants,
      status,
      is_active,
      notes,
    } = body;

    // Validation
    if (!name || !season_id) {
      return NextResponse.json(
        { error: "Name and season_id are required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO [groups] (
        name, description, season_id, min_participants, max_participants,
        current_participants, status, is_active, notes
      )
      VALUES (
        @name, @description, @season_id, @min_participants, @max_participants,
        0, @status, @is_active, @notes
      )
    `;

    await query(sql, {
      name,
      description,
      season_id,
      min_participants: min_participants || 0,
      max_participants: max_participants || 0,
      status: status || "פעיל",
      is_active: is_active ? 1 : 0,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding group:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

