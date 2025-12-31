import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchPermissionsForRoleGroup } from "@/lib/services/systemUserService";
import { decryptSession } from "@/lib/auth";

type SessionPayload = {
  national_id: string;
  role?: string;
  role_group_code?: string | null;
};

async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie?.value) {
      return null;
    }
    // שימוש בפענוח החדש
    return await decryptSession(sessionCookie.value);
  } catch (error) {
    console.error("Failed to parse session cookie", error);
    return null;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session?.national_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roleGroupCode = session.role_group_code || "management";

  try {
    const result = await fetchPermissionsForRoleGroup(roleGroupCode);
    const permissions: Record<string, string> = {};
    for (const record of result.recordset) {
      permissions[record.page_key] = record.permission_level;
    }
    return NextResponse.json({
      success: true,
      role_group_code: roleGroupCode,
      permissions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to load permissions", error);
    return NextResponse.json(
      { error: "Failed to load permissions", details: message },
      { status: 500 }
    );
  }
}
