import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET() {
  try {
    const res = await query("SELECT 1 AS test");
    return NextResponse.json(res.recordset);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
