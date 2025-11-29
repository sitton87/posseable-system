import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active");
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");

    let sql = `
      SELECT
        id,
        name,
        category,
        size,
        condition,
        active,
        notes
      FROM equipment
      WHERE 1=1
    `;

    const params: any = {};

    // Filter by active status
    if (activeOnly === "true") {
      sql += " AND active = 1";
    }

    // Filter by category
    if (category) {
      sql += " AND category = @category";
      params.category = category;
    }

    // Filter by condition
    if (condition) {
      sql += " AND condition = @condition";
      params.condition = condition;
    }

    sql += " ORDER BY name ASC";

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      equipment: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching equipment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

