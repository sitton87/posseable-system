import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { national_id, full_name, phone, email, kind } = body;

    if (!national_id || !full_name || !kind) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO volunteer (national_id, full_name, phone, email, kind)
       VALUES (@id, @name, @phone, @mail, @kind)`,
      {
        id: national_id,
        name: full_name,
        phone: phone || null,
        mail: email || null,
        kind,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
