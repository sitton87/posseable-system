import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active");

    let sql = `
      SELECT 
        supplier_identifier,
        identifier_type,
        name,
        contact_name,
        phone,
        email,
        notes,
        is_active,
        supplier_type,
        services_offered,
        has_active_contract
      FROM supplier
    `;

    // Filter by active status if requested
    if (activeOnly === "true") {
      sql += " WHERE is_active = 1";
    }

    sql += " ORDER BY name ASC";

    const result = await query(sql);

    return NextResponse.json({
      success: true,
      suppliers: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching suppliers:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

