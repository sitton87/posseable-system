import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, contact_name, phone, email, notes, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE supplier
      SET
        name = @name,
        contact_name = @contact_name,
        phone = @phone,
        email = @email,
        notes = @notes,
        is_active = @is_active
      WHERE id = @id
    `;

    await query(sql, {
      id,
      name,
      contact_name,
      phone,
      email,
      notes,
      is_active: is_active ? 1 : 0,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating supplier:", err);
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
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    // Soft delete - mark as inactive
    const sql = `UPDATE supplier SET is_active = 0 WHERE id = @id`;
    await query(sql, { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting supplier:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

