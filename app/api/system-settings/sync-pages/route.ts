import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasSystemAdminAccess } from "@/lib/utils/roles";
import { getUserBasicInfo } from "@/lib/services/authService";
import { syncAppPages } from "@/lib/services/systemUserService";
import {
  flattenHierarchy,
  PAGE_HIERARCHY,
} from "@/lib/permissions/pageHierarchy";

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

export async function POST(req: Request) {
  const context = await getAdminContext();
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const pages = flattenHierarchy(PAGE_HIERARCHY).map((node) => ({
      page_key: node.key,
      display_name: node.label,
      route_path: node.path || "#",
      category: node.category,
    }));

    const count = await syncAppPages(pages);

    return NextResponse.json({ success: true, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to sync pages", error);
    return NextResponse.json(
      { error: "Failed to sync pages", details: message },
      { status: 500 }
    );
  }
}

