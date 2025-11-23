import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active");

    let sql = `
      SELECT 
        id,
        full_name,
        phone,
        email,
        kind,
        active,
        notes,
        created_at
      FROM volunteer
    `;

    // Filter by active status if requested
    if (activeOnly === "true") {
      sql += " WHERE active = 1";
    }

    sql += " ORDER BY created_at DESC";

    const result = await query(sql);

    return NextResponse.json({
      success: true,
      volunteers: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching volunteers:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
