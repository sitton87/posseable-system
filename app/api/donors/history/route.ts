import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const donorId = searchParams.get("national_id");

    if (!donorId) {
      return NextResponse.json(
        { error: "חסר מזהה תורם (national_id)" },
        { status: 400 }
      );
    }

    const donationsResult = await query(
      `
        SELECT TOP 50
          ft.id,
          ft.transaction_date,
          ft.description,
          ft.amount,
          ft.currency,
          ft.created_at
        FROM finance_transaction_donor ftd
        INNER JOIN finance_transaction ft
          ON ft.id = ftd.finance_transaction_id
          AND ft.type = 'income'
          AND ft.category = N'תרומה'
        WHERE ftd.donor_id = @donorId
        ORDER BY ft.transaction_date DESC, ft.created_at DESC
      `,
      { donorId }
    );

    return NextResponse.json({
      success: true,
      donations: donationsResult.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching donor history:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

