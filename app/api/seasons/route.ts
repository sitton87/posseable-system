import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const sql = `
      SELECT 
        id,
        name,
        year,
        start_date,
        end_date,
        notes
      FROM season_plan
      ORDER BY year DESC, start_date DESC
    `;

    const result = await query(sql);

    return NextResponse.json({
      success: true,
      seasons: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching seasons:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

