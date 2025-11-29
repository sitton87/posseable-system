import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact_name, phone, email, notes, is_active } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO supplier (name, contact_name, phone, email, notes, is_active)
      VALUES (@name, @contact_name, @phone, @email, @notes, @is_active)
    `;

    await query(sql, {
      name,
      contact_name,
      phone,
      email,
      notes,
      is_active: is_active ? 1 : 0,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding supplier:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

