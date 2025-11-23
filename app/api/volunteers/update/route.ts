import { NextResponse } from "next/server";
import { query } from "@/db/connection";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const volunteerId = searchParams.get("volunteerId");

    if (!volunteerId) {
      return NextResponse.json(
        { error: "volunteerId is required" },
        { status: 400 }
      );
    }

    // Get volunteer's roles with role details
    const result = await query(
      `SELECT 
        vr.volunteer_id,
        vr.role_id,
        vr.assigned_at,
        r.name as role_name,
        r.description as role_description
      FROM volunteer_role vr
      INNER JOIN role r ON vr.role_id = r.id
      WHERE vr.volunteer_id = @volunteerId
      ORDER BY vr.assigned_at DESC`,
      { volunteerId }
    );

    return NextResponse.json({
      success: true,
      roles: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching volunteer roles:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { volunteer_id, role_id } = body;

    if (!volunteer_id || !role_id) {
      return NextResponse.json(
        { error: "volunteer_id and role_id are required" },
        { status: 400 }
      );
    }

    // Assign role to volunteer
    await query(
      `INSERT INTO volunteer_role (volunteer_id, role_id, assigned_at)
       VALUES (@volunteer_id, @role_id, GETDATE())`,
      { volunteer_id, role_id }
    );

    return NextResponse.json({
      success: true,
      message: "Role assigned successfully",
    });
  } catch (err: any) {
    console.error("Error assigning role:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const volunteer_id = searchParams.get("volunteerId");
    const role_id = searchParams.get("roleId");

    if (!volunteer_id || !role_id) {
      return NextResponse.json(
        { error: "volunteerId and roleId are required" },
        { status: 400 }
      );
    }

    // Remove role from volunteer
    await query(
      `DELETE FROM volunteer_role 
       WHERE volunteer_id = @volunteer_id AND role_id = @role_id`,
      { volunteer_id, role_id }
    );

    return NextResponse.json({
      success: true,
      message: "Role removed successfully",
    });
  } catch (err: any) {
    console.error("Error removing role:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
