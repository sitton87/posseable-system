import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(req: Request) {
  try {
    const sql = `
      SELECT id, name, description, requires_certification, requires_renewal, requires_training, color_hex
      FROM role
      ORDER BY name
    `;
    const result = await query(sql);
    return NextResponse.json({ success: true, roles: result.recordset });
  } catch (err: any) {
    console.error("Error fetching roles:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      name,
      description,
      requires_certification,
      requires_renewal,
      requires_training,
      color_hex,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await query(
      `INSERT INTO role (name, description, requires_certification, requires_renewal, requires_training, color_hex)
       VALUES (@name, @description, @requires_certification, @requires_renewal, @requires_training, @color_hex)`,
      {
        name,
        description: description || null,
        requires_certification: requires_certification ? 1 : 0,
        requires_renewal: requires_renewal ? 1 : 0,
        requires_training: requires_training ? 1 : 0,
        color_hex: color_hex || "#3b82f6",
      }
    );

    return NextResponse.json({ success: true, message: "Role created" });
  } catch (err: any) {
    console.error("Error creating role:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "write");
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const {
      id,
      name,
      description,
      requires_certification,
      requires_renewal,
      requires_training,
      color_hex,
    } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and Name are required" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE role
       SET name = @name,
           description = @description,
           requires_certification = @requires_certification,
           requires_renewal = @requires_renewal,
           requires_training = @requires_training,
           color_hex = @color_hex
       WHERE id = @id`,
      {
        id,
        name,
        description: description || null,
        requires_certification: requires_certification ? 1 : 0,
        requires_renewal: requires_renewal ? 1 : 0,
        requires_training: requires_training ? 1 : 0,
        color_hex: color_hex || "#3b82f6",
      }
    );

    return NextResponse.json({ success: true, message: "Role updated" });
  } catch (err: any) {
    console.error("Error updating role:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "write");
    if (!permission.allowed) return permission.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Check usage
    const usageCheck = await query(
      `SELECT COUNT(*) as count FROM volunteer_role WHERE role_id = @id`,
      { id }
    );
    if (usageCheck.recordset[0].count > 0) {
      return NextResponse.json(
        { error: "Cannot delete role in use" },
        { status: 400 }
      );
    }

    await query(`DELETE FROM role WHERE id = @id`, { id });

    return NextResponse.json({ success: true, message: "Role deleted" });
  } catch (err: any) {
    console.error("Error deleting role:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
