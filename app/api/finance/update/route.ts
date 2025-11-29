import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      transaction_date,
      type,
      category,
      amount,
      description,
      donor_id,
      supplier_id,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE finance_transaction
      SET
        transaction_date = @transaction_date,
        type = @type,
        category = @category,
        amount = @amount,
        description = @description,
        donor_id = @donor_id,
        supplier_id = @supplier_id,
        notes = @notes
      WHERE id = @id
    `;

    await query(sql, {
      id,
      transaction_date,
      type,
      category,
      amount,
      description,
      donor_id,
      supplier_id,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating transaction:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const sql = `DELETE FROM finance_transaction WHERE id = @id`;
    await query(sql, { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting transaction:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

