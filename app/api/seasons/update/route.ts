import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("seasons", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const { id, name, year, start_date, end_date, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Season ID is required" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE season_plan
      SET
        name = @name,
        year = @year,
        start_date = @start_date,
        end_date = @end_date,
        notes = @notes
      WHERE id = @id
    `;

    await query(sql, {
      id,
      name,
      year,
      start_date,
      end_date,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating season:", err);
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Season ID is required" },
        { status: 400 }
      );
    }

    const sql = `DELETE FROM season_plan WHERE id = @id`;
    await query(sql, { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting season:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

