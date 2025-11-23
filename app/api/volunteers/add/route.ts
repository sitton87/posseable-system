import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, phone, email, kind, active, notes } = body;

    // Validation
    if (!full_name) {
      return NextResponse.json(
        { error: "full_name is required" },
        { status: 400 }
      );
    }

    // Generate new GUID for id
    const id = crypto.randomUUID();

    // Insert volunteer
    await query(
      `INSERT INTO volunteer (id, full_name, phone, email, kind, active, notes, created_at)
       VALUES (@id, @full_name, @phone, @email, @kind, @active, @notes, GETDATE())`,
      {
        id,
        full_name,
        phone: phone || null,
        email: email || null,
        kind: kind || null,
        active: active !== undefined ? active : true, // Default to true
        notes: notes || null,
      }
    );

    return NextResponse.json({
      success: true,
      id,
      message: "Volunteer added successfully",
    });
  } catch (err: any) {
    console.error("Error adding volunteer:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
