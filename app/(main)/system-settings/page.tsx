import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSystemAdminAccess } from "@/lib/utils/roles";
import { getUserBasicInfo } from "@/lib/services/authService";
import SystemSettingsClient from "./SystemSettingsClient";

export default async function SystemSettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    redirect("/dashboard");
  }

  let session:
    | {
        national_id?: string;
        role?: string;
        role_group_code?: string | null;
      }
    | null = null;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/dashboard");
  }

  if (!session?.national_id) {
    redirect("/dashboard");
  }

  const userResult = await getUserBasicInfo(session.national_id);
  if (!userResult.recordset.length) {
    redirect("/dashboard");
  }

  const user = userResult.recordset[0];

  const hasAccess = hasSystemAdminAccess(user.role, user.role_group_code);

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ניהול מערכת</h1>
        <p className="mt-2 text-sm text-gray-600">
          יצירת משתמשים חדשים, הגדרת הרשאות ונהלי שדות למערכת Posseable.
        </p>
      </div>

      <SystemSettingsClient currentRole={user.role} />
    </div>
  );
}

