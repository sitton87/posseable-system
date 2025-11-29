import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, organization, phone, email, notes, is_active } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Generate new GUID for id (in case the table doesn't have a DEFAULT NEWID())
    const id = crypto.randomUUID();

    const sql = `
      INSERT INTO donor (id, name, organization, phone, email, notes, is_active)
      VALUES (@id, @name, @organization, @phone, @email, @notes, @is_active)
    `;

    await query(sql, {
      id,
      name,
      organization: organization || null,
      phone: phone || null,
      email: email || null,
      notes: notes || null,
      is_active: is_active ? 1 : 0,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding donor:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

