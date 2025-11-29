import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, size, condition, active, notes } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO equipment (name, category, size, condition, active, notes)
      VALUES (@name, @category, @size, @condition, @active, @notes)
    `;

    await query(sql, {
      name,
      category,
      size,
      condition,
      active: active ? 1 : 0,
      notes,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding equipment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

