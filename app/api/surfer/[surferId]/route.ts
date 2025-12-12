import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(
  _req: Request,
  { params }: { params: { surferId: string } }
) {
  try {
    const permission = await ensurePermissionResponse("surfers", "read");
    if (!permission.allowed) return permission.response;

    const surferId = params.surferId;
    if (!surferId) {
      return NextResponse.json(
        { error: "surferId is required" },
        { status: 400 }
      );
    }

    const surferResult = await query(
      `
        SELECT
          s.national_id,
          s.full_name,
          s.phone,
          s.email,
          s.residence,
          s.age,
          s.date_of_birth,
          s.gender,
          s.status,
          s.program,
          s.group_id,
          g.name AS group_name,
          s.medical_approval,
          s.medical_condition,
          s.needs_wheelchair,
          s.volunteers_needed,
          s.special_requirements,
          s.emergency_contact_name,
          s.emergency_contact_phone,
          s.active,
          s.notes,
          s.created_at
        FROM surfer s
        LEFT JOIN [group] g ON s.group_id = g.id
        WHERE s.national_id = @surferId
      `,
      { surferId }
    );

    if (!surferResult.recordset.length) {
      return NextResponse.json({ error: "Surfer not found" }, { status: 404 });
    }

    const contactsResult = await query(
      `
        SELECT
          contact_id,
          full_name,
          relationship,
          phone,
          email,
          priority,
          notes,
          created_at
        FROM surfer_emergency_contact
        WHERE surfer_id = @surferId
        ORDER BY COALESCE(priority, 999), created_at DESC
      `,
      { surferId }
    );

    const groupsResult = await query(
      `
        SELECT
          sg.id,
          sg.group_id,
          g.name AS group_name,
          sg.joined_at,
          sg.left_at,
          sg.role,
          sg.notes
        FROM surfer_group sg
        INNER JOIN [group] g ON sg.group_id = g.id
        WHERE sg.surfer_id = @surferId
        ORDER BY sg.joined_at DESC, sg.id DESC
      `,
      { surferId }
    );

    const volunteerActivitiesResult = await query(
      `
        SELECT
          a.id AS activity_id,
          a.activity_date,
          a.kind,
          av.volunteer_national_id,
          v.full_name AS volunteer_name
        FROM registration r
        INNER JOIN activity a ON r.activity_id = a.id
        INNER JOIN activity_volunteer av ON av.activity_id = a.id
        INNER JOIN volunteer v ON v.national_id = av.volunteer_national_id
        WHERE r.surfer_id = @surferId
        ORDER BY a.activity_date DESC, av.assigned_at DESC
      `,
      { surferId }
    );

    return NextResponse.json({
      success: true,
      surfer: surferResult.recordset[0],
      emergencyContacts: contactsResult.recordset || [],
      groups: groupsResult.recordset || [],
      volunteerActivities: volunteerActivitiesResult.recordset || [],
    });
  } catch (err: any) {
    console.error("Error fetching surfer detail:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

