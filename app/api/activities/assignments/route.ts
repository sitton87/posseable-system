import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const { activity_id, surfer_id, volunteer_id, role } = body;

    if (!activity_id || !surfer_id || !volunteer_id) {
      return NextResponse.json(
        { error: "activity_id, surfer_id, and volunteer_id are required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO activity_surfer_assignment (activity_id, surfer_id, volunteer_id, role)
      OUTPUT inserted.id
      VALUES (@activity_id, @surfer_id, @volunteer_id, @role)
    `;

    const result = await query(sql, {
      activity_id,
      surfer_id,
      volunteer_id,
      role,
    });

    return NextResponse.json({
      success: true,
      id: result.recordset[0].id,
    });
  } catch (err: any) {
    console.error("Error adding assignment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    await query("DELETE FROM activity_surfer_assignment WHERE id = @id", { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting assignment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

