import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active");

    let sql = `
      SELECT 
        d.national_id,
        d.full_name,
        d.organization,
        d.phone,
        d.email,
        d.notes,
        d.is_active,
        d.created_at,
        COALESCE(SUM(ftd.amount), 0) AS total_donations
      FROM donor d
      LEFT JOIN finance_transaction_donor ftd
        ON ftd.donor_id = d.national_id
      LEFT JOIN finance_transaction ft
        ON ft.id = ftd.finance_transaction_id
        AND ft.type = 'income'
        AND ft.category = N'תרומה'
      WHERE 1=1
    `;

    if (activeOnly === "true") {
      sql += " AND d.is_active = 1";
    }

    sql += `
      GROUP BY
        d.national_id,
        d.full_name,
        d.organization,
        d.phone,
        d.email,
        d.notes,
        d.is_active,
        d.created_at
      ORDER BY d.full_name ASC
    `;

    const result = await query(sql);

    return NextResponse.json({
      success: true,
      donors: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching donors:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

