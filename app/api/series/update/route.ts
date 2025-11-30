import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("seasons", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      id,
      name,
      description,
      status,
      start_date,
      end_date,
      lead_national_id,
      notes,
      is_default,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Series ID is required" },
        { status: 400 }
      );
    }

    const existing = await query(
      `SELECT season_id FROM season_activity_series WHERE id = @id`,
      { id }
    );

    if (!existing.recordset.length) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    const seasonId = existing.recordset[0].season_id;

    const trimmedName = name?.trim();
    if (!trimmedName) {
      return NextResponse.json(
        { error: "Series name is required" },
        { status: 400 }
      );
    }

    if (is_default) {
      await query(
        `
          UPDATE season_activity_series
          SET is_default = 0
          WHERE season_id = @season_id AND id <> @id
        `,
        { season_id: seasonId, id }
      );
    }

    await query(
      `
        UPDATE season_activity_series
        SET
          name = @name,
          description = @description,
          status = @status,
          start_date = @start_date,
          end_date = @end_date,
          lead_national_id = @lead_national_id,
          notes = @notes,
          is_default = @is_default
        WHERE id = @id
      `,
      {
        id,
        name: trimmedName,
        description: description || null,
        status: status || null,
        start_date: start_date || null,
        end_date: end_date || null,
        lead_national_id: lead_national_id || null,
        notes: notes || null,
        is_default: is_default ? 1 : 0,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating activity series:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("seasons", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "Series ID is required" },
        { status: 400 }
      );
    }

    const id = Number(idParam);

    const existing = await query(
      `SELECT season_id, is_default FROM season_activity_series WHERE id = @id`,
      { id }
    );

    if (!existing.recordset.length) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    const { season_id: seasonId, is_default } = existing.recordset[0];

    await query(`DELETE FROM season_activity_series WHERE id = @id`, { id });

    if (is_default) {
      await query(
        `
          WITH next_series AS (
            SELECT TOP 1 id
            FROM season_activity_series
            WHERE season_id = @season_id
            ORDER BY created_at ASC
          )
          UPDATE season_activity_series
          SET is_default = 1
          WHERE id IN (SELECT id FROM next_series)
        `,
        { season_id: seasonId }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting activity series:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

