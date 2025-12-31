import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(req: Request) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "read");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active");
    const classification = searchParams.get("classification");

    let sql = `
      SELECT
        national_id,
        full_name,
        phone,
        email,
        kind,
        street,
        house_number,
        city,
        join_date,
        training_date,
        total_activities,
        profession,
        sea_connection_level,
        active,
        notes,
        created_at,
        volunteer_type,
        media_specialization,
        availability,
        personal_website,
        documents,
        classification
      FROM volunteer
    `;

    const conditions: string[] = [];
    const params: any = {};

    // Filter by active status if requested
    if (activeOnly === "true") {
      conditions.push("active = 1");
    } else if (activeOnly === "false") {
      conditions.push("active = 0");
    }

    if (
      classification &&
      ["volunteer", "staff", "management"].includes(classification)
    ) {
      conditions.push("classification = @classification");
      params.classification = classification;
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY created_at DESC";

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      volunteers: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching volunteers:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
