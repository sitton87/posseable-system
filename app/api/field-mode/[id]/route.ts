import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[API] Fetching field mode data for Activity ID: ${id}`);

    const permission = await ensurePermissionResponse("activities", "read");
    if (!permission.allowed) return permission.response;

    // 1. Fetch Activity Details
    const activitySql = `
      SELECT
        a.id,
        g.name as group_name,
        a.activity_date,
        CONVERT(varchar(5), a.start_time, 108) as start_time,
        CONVERT(varchar(5), a.end_time, 108) as end_time,
        a.location,
        a.sea_condition,
        a.weather_notes
      FROM activity a
      LEFT JOIN [group] g ON a.group_id = g.id
      WHERE a.id = @id
    `;

    // 2. Fetch Surfers (Registered) with Assignments and Emergency Info
    // We only care about surfers who are REGISTERED (approved/pending) for this activity.
    const surfersSql = `
      SELECT
        s.national_id,
        s.full_name,
        s.medical_condition,
        s.special_requirements,
        s.needs_wheelchair,
        r.id as registration_id,
        r.status as attendance_status, -- 'Approved' usually means registered, we might need a separate 'Attended' flag or use status
        r.attendance_status as actual_attendance, -- Let's assume we use this column for check-in
        
        -- Emergency Contact (First one)
        ec.full_name as emergency_name,
        ec.phone as emergency_phone,
        ec.relationship as emergency_rel,

        -- Assigned Team (Lead)
        lead_vol.full_name as lead_volunteer_name,
        lead_vol.phone as lead_volunteer_phone
        
      FROM registration r
      JOIN surfer s ON s.national_id = r.surfer_id
      
      -- Get Emergency Contact (Top 1)
      OUTER APPLY (
        SELECT TOP 1 full_name, phone, relationship
        FROM surfer_emergency_contact
        WHERE surfer_id = s.national_id
        ORDER BY priority ASC
      ) ec

      -- Get Assigned Lead Volunteer
      OUTER APPLY (
        SELECT TOP 1 v.full_name, v.phone
        FROM activity_surfer_assignment asa
        JOIN volunteer v ON v.national_id = asa.volunteer_id
        WHERE asa.activity_id = r.activity_id 
          AND asa.surfer_id = s.national_id
          AND asa.role = 'lead'
      ) lead_vol

      WHERE r.activity_id = @id
      ORDER BY s.full_name
    `;

    const [activityRes, surfersRes] = await Promise.all([
      query(activitySql, { id }),
      query(surfersSql, { id }),
    ]);

    if (!activityRes.recordset.length) {
      console.warn(`[API] Activity not found for ID: ${id}`);
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    console.log(`[API] Found activity: ${activityRes.recordset[0].group_name}`);
    console.log(`[API] Found ${surfersRes.recordset.length} registered surfers`);

    return NextResponse.json({
      success: true,
      activity: activityRes.recordset[0],
      surfers: surfersRes.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching field mode data:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

