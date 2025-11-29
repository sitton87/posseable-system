import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      description,
      season_id,
      min_participants,
      max_participants,
      status,
      is_active,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE [groups]
      SET
        name = @name,
        description = @description,
        season_id = @season_id,
        min_participants = @min_participants,
        max_participants = @max_participants,
        status = @status,
        is_active = @is_active,
        notes = @notes,
        updated_at = GETDATE()
      WHERE id = @id
    `;

    await query(sql, {
      id,
      name,
      description,
      season_id,
      min_participants,
      max_participants,
      status,
      is_active: is_active ? 1 : 0,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating group:", err);
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
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Soft delete - mark as inactive
    const sql = `UPDATE [groups] SET is_active = 0, updated_at = GETDATE() WHERE id = @id`;
    await query(sql, { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting group:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

