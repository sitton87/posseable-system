import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, category, size, condition, active, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Equipment ID is required" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE equipment
      SET
        name = @name,
        category = @category,
        size = @size,
        condition = @condition,
        active = @active,
        notes = @notes
      WHERE id = @id
    `;

    await query(sql, {
      id,
      name,
      category,
      size,
      condition,
      active: active ? 1 : 0,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating equipment:", err);
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
        { error: "Equipment ID is required" },
        { status: 400 }
      );
    }

    // Soft delete - mark as inactive
    const sql = `UPDATE equipment SET active = 0 WHERE id = @id`;
    await query(sql, { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting equipment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

