import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; roleId: string }> }
) {
  try {
    const permission = await ensurePermissionResponse("volunteers", "read");
    if (!permission.allowed) return permission.response;

    const resolvedParams = await params;
    const { id, roleId } = resolvedParams;

    const sql = `
      SELECT certificate_data, certificate_mime, certificate_name
      FROM volunteer_role
      WHERE volunteer_national_id = @id AND role_id = @roleId
    `;
    const result = await query(sql, { id, roleId });
    
    if (result.recordset.length === 0 || !result.recordset[0].certificate_data) {
       return new NextResponse("File not found", { status: 404 });
    }

    const file = result.recordset[0];
    
    // Create headers for file download
    const headers = new Headers();
    headers.set("Content-Type", file.certificate_mime || "application/octet-stream");
    // Use inline to display in browser if possible, attachment to force download
    // User asked to "display file", so inline is better for PDF/Images.
    headers.set("Content-Disposition", `inline; filename="${file.certificate_name || 'certificate'}"`);

    return new NextResponse(file.certificate_data, {
      status: 200,
      headers
    });

  } catch (err: any) {
    console.error("Error fetching certificate:", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}

