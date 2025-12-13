import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const sql = `
      SELECT 
        vr.role_id,
        r.name as role_name,
        r.color_hex,
        vr.assigned_at,
        vr.valid_until,
        vr.training_date,
        CASE 
          WHEN vr.certificate_name IS NOT NULL THEN 
            CONCAT('/api/volunteers/', vr.volunteer_national_id, '/roles/', vr.role_id, '/certificate')
          ELSE vr.certificate_url 
        END as certificate_url,
        vr.notes,
        vr.certificate_name
      FROM volunteer_role vr
      JOIN role r ON vr.role_id = r.id
      WHERE vr.volunteer_national_id = @id
      ORDER BY r.name
    `;
    
    const result = await query(sql, { id });
    return NextResponse.json({ success: true, roles: result.recordset });
  } catch (err: any) {
    console.error("Error fetching volunteer roles:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "write");
    if (!permission.allowed) return permission.response;

    const resolvedParams = await params;
    const { id } = resolvedParams; // volunteer_national_id
    const body = await req.json();
    const { role_id, valid_until, training_date, certificate_file, notes } = body;

    if (!role_id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
    }

    // Check if already assigned
    const check = await query(
      `SELECT COUNT(*) as count FROM volunteer_role WHERE volunteer_national_id = @id AND role_id = @role_id`,
      { id, role_id }
    );

    if (check.recordset[0].count > 0) {
      return NextResponse.json(
        { error: "Role already assigned to this volunteer" },
        { status: 400 }
      );
    }

    // Handle certificate file
    let certData = null;
    let certMime = null;
    let certName = null;

    if (certificate_file && certificate_file.data) {
        certData = Buffer.from(certificate_file.data, 'base64');
        certMime = certificate_file.mime;
        certName = certificate_file.name;
    }

    // We assume columns certificate_data, certificate_mime, certificate_name exist
    // If not, this query will fail, but the user should run the SQL script.
    await query(
      `INSERT INTO volunteer_role (
          volunteer_national_id, role_id, assigned_at, valid_until, training_date, notes,
          certificate_data, certificate_mime, certificate_name
       )
       VALUES (
          @id, @role_id, sysdatetime(), @valid_until, @training_date, @notes,
          @certData, @certMime, @certName
       )`,
      {
        id,
        role_id,
        valid_until: valid_until || null,
        training_date: training_date || null,
        notes: notes || null,
        certData: { type: "varbinary(max)", value: certData },
        certMime: certMime,
        certName: certName
      }
    );

    return NextResponse.json({ success: true, message: "Role assigned" });
  } catch (err: any) {
    console.error("Error assigning role:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
