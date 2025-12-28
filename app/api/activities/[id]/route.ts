import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const permission = await ensurePermissionResponse("activities", "read");
    if (!permission.allowed) return permission.response;

    // 1. Fetch Activity Details
    const activitySql = `
      SELECT
        a.id,
        a.season_id,
        a.series_id,
        a.group_id,
        a.kind,
        a.activity_date,
        CONVERT(varchar(5), a.start_time, 108) as start_time,
        CONVERT(varchar(5), a.end_time, 108) as end_time,
        a.location,
        a.capacity,
        a.status,
        a.notes,
        a.created_at,
        a.activity_manager_id,
        a.safety_manager_id,
        a.sea_condition,
        a.weather_notes,
        a.summary_general,
        a.summary_preserve,
        a.summary_improve,
        g.name as group_name,
        sas.name as series_name,
        vm.full_name AS activity_manager_name,
        vs.full_name AS safety_manager_name,
        (SELECT COUNT(*) FROM activity a2 WHERE a2.series_id = a.series_id) as series_total_count,
        (SELECT COUNT(*) FROM activity a3 WHERE a3.series_id = a.series_id AND a3.activity_date <= a.activity_date) as series_index
      FROM activity a
      INNER JOIN season_activity_series sas ON sas.id = a.series_id
      LEFT JOIN [group] g ON a.group_id = g.id
      LEFT JOIN volunteer vm ON a.activity_manager_id = vm.national_id
      LEFT JOIN volunteer vs ON a.safety_manager_id = vs.national_id
      WHERE a.id = @id
    `;

    // 2. Fetch Assignments (Surfers & Volunteers)
    const assignmentsSql = `
      SELECT
        asa.id,
        asa.surfer_id,
        s.full_name as surfer_name,
        asa.volunteer_id,
        v.full_name as volunteer_name,
        asa.role
      FROM activity_surfer_assignment asa
      JOIN surfer s ON s.national_id = asa.surfer_id
      JOIN volunteer v ON v.national_id = asa.volunteer_id
      WHERE asa.activity_id = @id
    `;

    // 3. Fetch Equipment Requests
    const equipmentSql = `
      SELECT
        aer.id,
        aer.item_id,
        ei.name as item_name,
        aer.quantity,
        aer.status,
        aer.notes
      FROM activity_equipment_request aer
      JOIN equipment_item ei ON ei.id = aer.item_id
      WHERE aer.activity_id = @id
    `;

    // 4. Fetch Checklist
    const checklistSql = `
      SELECT ac.*, v.full_name as assigned_to_volunteer_name
      FROM activity_checklist ac
      LEFT JOIN volunteer v ON v.national_id = ac.assigned_to_volunteer_id
      WHERE ac.activity_id = @id
      ORDER BY ac.category, ac.item_text
    `;

    const [activityRes, assignmentsRes, equipmentRes, checklistRes] = await Promise.all([
      query(activitySql, { id }),
      query(assignmentsSql, { id }),
      query(equipmentSql, { id }),
      query(checklistSql, { id }),
    ]);

    if (!activityRes.recordset.length) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    const activity = activityRes.recordset[0];
    activity.assignments = assignmentsRes.recordset;
    activity.equipment = equipmentRes.recordset;
    activity.checklist = checklistRes.recordset;

    return NextResponse.json({ success: true, activity });
  } catch (err: any) {
    console.error("Error fetching activity details:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

