import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fetchPermissionsForRoleGroup } from "@/lib/services/systemUserService";
import type { PermissionLevel } from "@/type";

type SessionPayload = {
  national_id: string;
  role?: string;
  role_group_code?: string | null;
};

type PermissionCacheEntry = {
  expiresAt: number;
  permissions: Record<string, PermissionLevel>;
};

const permissionCache = new Map<string, PermissionCacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

function getPermissionWeight(level: PermissionLevel) {
  switch (level) {
    case "write":
      return 2;
    case "read":
      return 1;
    default:
      return 0;
  }
}

async function loadPermissions(roleGroupCode: string) {
  const cached = permissionCache.get(roleGroupCode);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.permissions;
  }

  const result = await fetchPermissionsForRoleGroup(roleGroupCode);
  const permissions: Record<string, PermissionLevel> = {};
  for (const record of result.recordset) {
    permissions[record.page_key] = record.permission_level as PermissionLevel;
  }

  permissionCache.set(roleGroupCode, {
    permissions,
    expiresAt: now + CACHE_TTL_MS,
  });

  return permissions;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie?.value) {
      return null;
    }
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error("Failed to parse session cookie", error);
    return null;
  }
}

export async function hasPermission(
  roleGroupCode: string | null | undefined,
  pageKey: string,
  required: PermissionLevel
) {
  const effectiveGroup = roleGroupCode || "management";
  const permissions = await loadPermissions(effectiveGroup);
  const current = permissions[pageKey] ?? "none";
  return getPermissionWeight(current) >= getPermissionWeight(required);
}

export async function ensurePermissionResponse(
  pageKey: string,
  required: PermissionLevel,
  customMessage?: string
) {
  const session = await getSession();
  if (!session?.national_id) {
    return {
      allowed: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const allowed = await hasPermission(session.role_group_code, pageKey, required);
  if (!allowed) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error:
            customMessage ||
            "אין לך הרשאת גישה לבצע פעולה זו. פנה למנהל המערכת.",
        },
        { status: 403 }
      ),
    };
  }

  return { allowed: true, session };
}

