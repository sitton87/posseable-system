import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("seasons", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const { name, year, start_date, end_date, notes } = body;

    // Validation
    if (!name || !year || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Name, year, start_date, and end_date are required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO season_plan (name, year, start_date, end_date, notes)
      VALUES (@name, @year, @start_date, @end_date, @notes)
    `;

    await query(sql, {
      name,
      year: parseInt(year),
      start_date,
      end_date,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding season:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

