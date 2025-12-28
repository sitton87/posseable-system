import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const { activity_id, item_text, category, assigned_to_volunteer_id, due_date } = body;

    if (!activity_id || !item_text) {
      return NextResponse.json(
        { error: "activity_id and item_text are required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO activity_checklist (activity_id, item_text, category, is_completed, assigned_to_volunteer_id, due_date)
      OUTPUT inserted.id
      VALUES (@activity_id, @item_text, @category, 0, @assigned_to_volunteer_id, @due_date)
    `;

    const result = await query(sql, { 
      activity_id, 
      item_text, 
      category, 
      assigned_to_volunteer_id: assigned_to_volunteer_id || null,
      due_date: due_date || null
    });

    return NextResponse.json({
      success: true,
      id: result.recordset[0].id,
    });
  } catch (err: any) {
    console.error("Error adding checklist item:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const { id, is_completed, item_text, assigned_to_volunteer_id, due_date, is_deleted } = body;

    if (!id) {
      return NextResponse.json({ error: "Checklist ID is required" }, { status: 400 });
    }

    let sql = "UPDATE activity_checklist SET ";
    const params: any = { id };
    const updates = [];

    if (is_completed !== undefined) {
      updates.push("is_completed = @is_completed");
      params.is_completed = is_completed;
    }
    if (is_deleted !== undefined) {
      updates.push("is_deleted = @is_deleted");
      params.is_deleted = is_deleted;
    }
    if (item_text !== undefined) {
      updates.push("item_text = @item_text");
      params.item_text = item_text;
    }
    if (assigned_to_volunteer_id !== undefined) {
      updates.push("assigned_to_volunteer_id = @assigned_to_volunteer_id");
      params.assigned_to_volunteer_id = assigned_to_volunteer_id || null;
    }
    if (due_date !== undefined) {
      updates.push("due_date = @due_date");
      params.due_date = due_date || null;
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true });
    }

    sql += updates.join(", ") + " WHERE id = @id";

    await query(sql, params);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating checklist item:", err);
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
        { error: "Checklist ID is required" },
        { status: 400 }
      );
    }

    await query("UPDATE activity_checklist SET is_deleted = 1 WHERE id = @id", { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting checklist item:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
