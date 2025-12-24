import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("activities", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const { activity_id, item_id, quantity, notes } = body;

    if (!activity_id || !item_id || !quantity) {
      return NextResponse.json(
        { error: "activity_id, item_id, and quantity are required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO activity_equipment_request (activity_id, item_id, quantity, status, notes)
      OUTPUT inserted.id
      VALUES (@activity_id, @item_id, @quantity, 'REQUESTED', @notes)
    `;

    const result = await query(sql, {
      activity_id,
      item_id,
      quantity,
      notes,
    });

    return NextResponse.json({
      success: true,
      id: result.recordset[0].id,
    });
  } catch (err: any) {
    console.error("Error adding equipment request:", err);
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
    const { id, quantity, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    let sql = "UPDATE activity_equipment_request SET ";
    const params: any = { id };
    const updates = [];

    if (quantity !== undefined) {
      updates.push("quantity = @quantity");
      params.quantity = quantity;
    }
    if (status !== undefined) {
      updates.push("status = @status");
      params.status = status;
    }
    if (notes !== undefined) {
      updates.push("notes = @notes");
      params.notes = notes;
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: true });
    }

    sql += updates.join(", ") + " WHERE id = @id";

    await query(sql, params);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating equipment request:", err);
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
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    await query("DELETE FROM activity_equipment_request WHERE id = @id", { id });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting equipment request:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

