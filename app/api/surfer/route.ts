import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active");
    const program = searchParams.get("program");
    const status = searchParams.get("status");

    let sql = `
      SELECT
        national_id,
        full_name,
        phone,
        email,
        residence,
        age,
        date_of_birth,
        gender,
        status,
        program,
        group_id,
        medical_approval,
        medical_condition,
        needs_wheelchair,
        volunteers_needed,
        special_requirements,
        emergency_contact_name,
        emergency_contact_phone,
        active,
        notes,
        created_at
      FROM surfer
      WHERE 1=1
    `;

    const params: any = {};

    // Filter by active status
    if (activeOnly === "true") {
      sql += " AND active = 1";
    }

    // Filter by program
    if (program) {
      sql += " AND program = @program";
      params.program = program;
    }

    // Filter by status
    if (status) {
      sql += " AND status = @status";
      params.status = status;
    }

    sql += " ORDER BY created_at DESC";

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      surfers: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching surfers:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
