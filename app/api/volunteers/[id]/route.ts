import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Fetch activities
    const activitiesSql = `
      SELECT 
        a.id as activity_id,
        a.activity_date,
        a.kind,
        av.volunteer_national_id,
        s.full_name as surfer_name
      FROM activity_volunteer av
      JOIN activity a ON av.activity_id = a.id
      LEFT JOIN registration r ON a.id = r.activity_id
      LEFT JOIN surfer s ON r.surfer_id = s.national_id
      WHERE av.volunteer_national_id = @id
      ORDER BY a.activity_date DESC
    `;
    const activitiesResult = await query(activitiesSql, { id });

    // Fetch supported surfers (surfers in groups this volunteer is associated with?)
    // Or strictly from activities? 
    // The previous frontend code implied "supported surfers". 
    // Let's assume it means surfers they interacted with in activities or are in the same group.
    // For now, let's keep it simple: surfers from activities they participated in.
    
    const surfersSql = `
      SELECT DISTINCT
        s.national_id,
        s.full_name,
        s.program,
        s.status,
        g.name as group_name
      FROM activity_volunteer av
      JOIN activity a ON av.activity_id = a.id
      JOIN registration r ON a.id = r.activity_id
      JOIN surfer s ON r.surfer_id = s.national_id
      LEFT JOIN "group" g ON s.group_id = g.id
      WHERE av.volunteer_national_id = @id
    `;
    const surfersResult = await query(surfersSql, { id });

    return NextResponse.json({
      success: true,
      activities: activitiesResult.recordset,
      supportedSurfers: surfersResult.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching volunteer details:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "write");
    if (!permission.allowed) return permission.response;

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await query(`DELETE FROM volunteer WHERE national_id = @id`, { id });

    return NextResponse.json({ success: true, message: "Volunteer deleted" });
  } catch (err: any) {
    console.error("Error deleting volunteer:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}



