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

  let session: {
    national_id?: string;
    role?: string;
    role_group_code?: string | null;
  } | null = null;
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
      <SystemSettingsClient currentRole={user.role} />
    </div>
  );
}
