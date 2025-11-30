import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("seasons", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      season_id,
      name,
      description,
      status,
      start_date,
      end_date,
      lead_national_id,
      notes,
      is_default,
    } = body;

    if (!season_id || !name?.trim()) {
      return NextResponse.json(
        { error: "season_id and name are required" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    const payload = {
      season_id: Number(season_id),
      name: trimmedName,
      description: description?.trim() || null,
      status: status?.trim() || null,
      start_date: start_date || null,
      end_date: end_date || null,
      lead_national_id: lead_national_id?.trim() || null,
      notes: notes?.trim() || null,
      is_default: Boolean(is_default) ? 1 : 0,
    };

    if (payload.is_default) {
      await query(
        `
          UPDATE season_activity_series
          SET is_default = 0
          WHERE season_id = @season_id
        `,
        { season_id: payload.season_id }
      );
    }

    const insertSql = `
      INSERT INTO season_activity_series (
        season_id,
        name,
        description,
        status,
        start_date,
        end_date,
        lead_national_id,
        notes,
        is_default
      )
      VALUES (
        @season_id,
        @name,
        @description,
        @status,
        @start_date,
        @end_date,
        @lead_national_id,
        @notes,
        @is_default
      )
    `;

    await query(insertSql, payload);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding activity series:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

