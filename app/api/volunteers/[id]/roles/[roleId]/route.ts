import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "write");
    if (!permission.allowed) return permission.response;

    const resolvedParams = await params;
    const { id, roleId } = resolvedParams;
    const body = await req.json();
    const { valid_until, training_date, certificate_file, notes } = body;

    let certData = null;
    let certMime = null;
    let certName = null;
    let updateCert = false;

    if (certificate_file && certificate_file.data) {
        certData = Buffer.from(certificate_file.data, 'base64');
        certMime = certificate_file.mime;
        certName = certificate_file.name;
        updateCert = true;
    }

    if (updateCert) {
        await query(
          `UPDATE volunteer_role
           SET valid_until = @valid_until,
               training_date = @training_date,
               certificate_data = @certData,
               certificate_mime = @certMime,
               certificate_name = @certName,
               notes = @notes
           WHERE volunteer_national_id = @id AND role_id = @roleId`,
          {
            id,
            roleId,
            valid_until: valid_until || null,
            training_date: training_date || null,
            certData: { type: "varbinary(max)", value: certData },
            certMime,
            certName,
            notes: notes || null
          }
        );
    } else {
        await query(
          `UPDATE volunteer_role
           SET valid_until = @valid_until,
               training_date = @training_date,
               notes = @notes
           WHERE volunteer_national_id = @id AND role_id = @roleId`,
          {
            id,
            roleId,
            valid_until: valid_until || null,
            training_date: training_date || null,
            notes: notes || null
          }
        );
    }

    return NextResponse.json({ success: true, message: "Role assignment updated" });
  } catch (err: any) {
    console.error("Error updating role assignment:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "write");
    if (!permission.allowed) return permission.response;

    const resolvedParams = await params;
    const { id, roleId } = resolvedParams;

    await query(
      `DELETE FROM volunteer_role WHERE volunteer_national_id = @id AND role_id = @roleId`,
      { id, roleId }
    );

    return NextResponse.json({ success: true, message: "Role unassigned" });
  } catch (err: any) {
    console.error("Error unassigning role:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
