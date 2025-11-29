import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let sql = `
      SELECT 
        id,
        transaction_date,
        type,
        category,
        amount,
        description,
        donor_id,
        supplier_id,
        notes,
        created_at
      FROM finance_transaction
      WHERE 1=1
    `;

    const params: any = {};

    // Filter by type
    if (type) {
      sql += " AND type = @type";
      params.type = type;
    }

    sql += " ORDER BY transaction_date DESC, created_at DESC";

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      transactions: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching transactions:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

