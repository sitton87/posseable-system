import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminRole } from "@/lib/utils/roles";
import SystemSettingsClient from "./SystemSettingsClient";

export default async function SystemSettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    redirect("/dashboard");
  }

  let session: { role?: string } | null = null;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/dashboard");
  }

  if (!session?.role || !isAdminRole(session.role)) {
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

      <SystemSettingsClient currentRole={session.role} />
    </div>
  );
}

