import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSystemAdminAccess } from "@/lib/utils/roles";
import { decryptSession } from "@/lib/auth";
import SystemSettingsClient from "./SystemSettingsClient";

export default async function SystemSettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    redirect("/dashboard");
  }

  let session: {
    national_id?: string;
    role?: string;
    role_group_code?: string | null;
  } | null = null;
  
  try {
    session = await decryptSession(sessionCookie.value);
  } catch {
    redirect("/dashboard");
  }

  if (!session?.national_id) {
    redirect("/dashboard");
  }

  // בדיקת הרשאות מתבססת על נתוני ה-session (שכוללים role_group_code: "management" במצב פיתוח)
  const hasAccess = hasSystemAdminAccess(session.role, session.role_group_code);

  if (!hasAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <SystemSettingsClient currentRole={session.role} />
    </div>
  );
}
