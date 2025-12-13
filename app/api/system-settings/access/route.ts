import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasSystemAdminAccess } from "@/lib/utils/roles";
import {
  fetchAppPages,
  fetchPermissionsForRoleGroup,
  fetchRoleGroups,
  upsertRoleGroupPermissions,
} from "@/lib/services/systemUserService";
import { getUserBasicInfo } from "@/lib/services/authService";

type AppPageRow = {
  page_key: string;
  display_name: string;
  route_path: string;
  category?: string | null;
};

const DEFAULT_PAGE_DEFINITIONS: AppPageRow[] = [
  {
    page_key: "dashboard",
    display_name: "דף הבית",
    route_path: "/dashboard",
    category: "כללי",
  },
  {
    page_key: "volunteers",
    display_name: "מתנדבים",
    route_path: "/volunteers",
    category: "תפעול",
  },
  {
    page_key: "surfers",
    display_name: "גולשים",
    route_path: "/surfers",
    category: "תפעול",
  },
  {
    page_key: "groups",
    display_name: "קבוצות",
    route_path: "/groups",
    category: "תפעול",
  },
  {
    page_key: "activities",
    display_name: "פעילויות",
    route_path: "/activities",
    category: "תפעול",
  },
  {
    page_key: "seasons",
    display_name: "עונות",
    route_path: "/seasons",
    category: "תכנון",
  },
  {
    page_key: "equipment",
    display_name: "ציוד",
    route_path: "/equipment",
    category: "לוגיסטיקה",
  },
  {
    page_key: "suppliers",
    display_name: "ספקים",
    route_path: "/suppliers",
    category: "לוגיסטיקה",
  },
  {
    page_key: "donors",
    display_name: "תורמים",
    route_path: "/donors",
    category: "כספים",
  },
  {
    page_key: "finance",
    display_name: "כספים",
    route_path: "/finance",
    category: "כספים",
  },
];

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
    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error("Failed to parse session cookie", error);
    return null;
  }
}

async function getAdminContext() {
  const session = await getSession();
  if (!session?.national_id) {
    return null;
  }

  const userResult = await getUserBasicInfo(session.national_id);
  if (!userResult.recordset.length) {
    return null;
  }

  const user = userResult.recordset[0];
  const allowed = hasSystemAdminAccess(user.role, user.role_group_code);
  if (!allowed) {
    return null;
  }

  return { session, user };
}

function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function GET(req: Request) {
  const context = await getAdminContext();
  if (!context) {
    return forbiddenResponse();
  }

  try {
    const { searchParams } = new URL(req.url);
    const requestedGroup = searchParams.get("roleGroupCode") || undefined;

    const [roleGroupsResult, pagesResult] = await Promise.all([
      fetchRoleGroups(),
      fetchAppPages(),
    ]);

    const roleGroups = roleGroupsResult.recordset;

    const pages = (pagesResult.recordset as AppPageRow[]).sort((a, b) => {
      const categoryCompare =
        (a.category || "").localeCompare(b.category || "", "he");
      if (categoryCompare !== 0) {
        return categoryCompare;
      }
      return a.display_name.localeCompare(b.display_name, "he");
    });
    const fallbackGroup =
      requestedGroup ||
      roleGroups.find((group) => group.is_default)?.code ||
      roleGroups[0]?.code ||
      null;

    let permissions: any[] = [];
    if (fallbackGroup) {
      const permissionsResult = await fetchPermissionsForRoleGroup(fallbackGroup);
      permissions = permissionsResult.recordset;
    }

    return NextResponse.json({
      success: true,
      roleGroups,
      pages,
      roleGroupCode: fallbackGroup,
      permissions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch role group permissions", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions", details: message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const context = await getAdminContext();
  if (!context) {
    return forbiddenResponse();
  }

  try {
    const body = await req.json();
    const { roleGroupCode, permissions } = body ?? {};

    if (!roleGroupCode || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "roleGroupCode and permissions are required" },
        { status: 400 }
      );
    }

    const sanitizedPermissions = permissions
      .map((permission: any) => ({
        page_key: String(permission.page_key),
        permission_level: String(permission.permission_level).toLowerCase(),
      }))
      .filter((permission) =>
        ["none", "read", "write"].includes(permission.permission_level)
      );

    await upsertRoleGroupPermissions(
      roleGroupCode,
      sanitizedPermissions,
      context.session.national_id
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to update role group permissions", error);
    return NextResponse.json(
      { error: "Failed to update permissions", details: message },
      { status: 500 }
    );
  }
}

