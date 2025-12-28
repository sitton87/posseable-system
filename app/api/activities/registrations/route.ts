import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activity_id = searchParams.get("activity_id");

    if (!activity_id) {
      return NextResponse.json({ error: "activity_id is required" }, { status: 400 });
    }

    const sql = `
      SELECT r.id, r.activity_id, r.surfer_id, r.status, r.attendance_status, r.notes, s.full_name as surfer_name
      FROM registration r
      JOIN surfer s ON s.national_id = r.surfer_id
      WHERE r.activity_id = @activity_id
    `;

    const result = await query(sql, { activity_id });
    return NextResponse.json({ success: true, registrations: result.recordset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const { activity_id, surfer_id, status } = body;

    if (!activity_id || !surfer_id) {
      return NextResponse.json({ error: "activity_id and surfer_id are required" }, { status: 400 });
    }

    // Check if already registered
    const check = await query(
      "SELECT id FROM registration WHERE activity_id = @activity_id AND surfer_id = @surfer_id",
      { activity_id, surfer_id }
    );

    if (check.recordset.length > 0) {
        // Update existing
        await query(
            "UPDATE registration SET status = @status WHERE id = @id",
            { status: status || 'Approved', id: check.recordset[0].id }
        );
        return NextResponse.json({ success: true, id: check.recordset[0].id });
    }

    const sql = `
      INSERT INTO registration (activity_id, surfer_id, status, created_at)
      OUTPUT inserted.id
      VALUES (@activity_id, @surfer_id, @status, sysdatetime())
    `;

    const result = await query(sql, { 
        activity_id, 
        surfer_id, 
        status: status || 'Approved' 
    });

    return NextResponse.json({ success: true, id: result.recordset[0].id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
      const permission = await ensurePermissionResponse("activities", "write");
      if (!permission.allowed) return permission.response;
  
      const body = await req.json();
      const { id, attendance_status, notes } = body;
  
      if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }
  
      let sql = "UPDATE registration SET ";
      const params: any = { id };
      const updates = [];
  
      if (attendance_status !== undefined) {
        updates.push("attendance_status = @attendance_status");
        params.attendance_status = attendance_status;
      }
      if (notes !== undefined) {
        updates.push("notes = @notes");
        params.notes = notes;
      }
  
      if (updates.length === 0) return NextResponse.json({ success: true });
  
      sql += updates.join(", ") + " WHERE id = @id";
  
      await query(sql, params);
  
      return NextResponse.json({ success: true });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

export async function DELETE(req: Request) {
    try {
      const permission = await ensurePermissionResponse("activities", "write");
      if (!permission.allowed) return permission.response;
  
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
      }
  
      await query("DELETE FROM registration WHERE id = @id", { id });
  
      return NextResponse.json({ success: true });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }