import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      transaction_date,
      type,
      category,
      amount,
      description,
      donor_id,
      supplier_id,
      notes,
    } = body;

    // Validation
    if (!transaction_date || !type || !category || !amount || !description) {
      return NextResponse.json(
        {
          error:
            "transaction_date, type, category, amount, and description are required",
        },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO finance_transaction (
        transaction_date, type, category, amount, description,
        donor_id, supplier_id, notes
      )
      VALUES (
        @transaction_date, @type, @category, @amount, @description,
        @donor_id, @supplier_id, @notes
      )
    `;

    await query(sql, {
      transaction_date,
      type,
      category,
      amount: parseFloat(amount),
      description,
      donor_id,
      supplier_id,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding transaction:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

