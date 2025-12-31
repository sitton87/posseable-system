import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("groups", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      id,
      name,
      description,
      season_id,
      start_season_id,
      additional_seasons,
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
      UPDATE [group]
      SET
        name = @name,
        description = @description,
        season_id = @season_id,
        start_season_id = @start_season_id,
        additional_seasons = @additional_seasons,
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
      start_season_id,
      additional_seasons:
        Array.isArray(additional_seasons) && additional_seasons.length > 0
          ? JSON.stringify(additional_seasons)
          : additional_seasons || null,
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
    const permission = await ensurePermissionResponse("groups", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    // Soft delete - set is_deleted flag
    const sql = `UPDATE [group] SET is_deleted = 1, updated_at = GETDATE() WHERE id = @id`;
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

