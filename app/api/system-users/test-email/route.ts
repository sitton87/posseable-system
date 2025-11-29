import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendTestEmail } from "@/lib/services/emailService";
import { isAdminRole } from "@/lib/utils/roles";

type SessionPayload = {
  national_id: string;
  role?: string;
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

function forbiddenResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function generatePassword() {
  return `Test-${Math.random().toString(36).slice(-6)}`;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) {
    return forbiddenResponse();
  }

  try {
    const body = await req.json();
    const email = String(body?.email || "").trim();
    const temporaryPassword =
      String(body?.temporaryPassword || "").trim() || generatePassword();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    await sendTestEmail(email, temporaryPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to send test email", error);
    return NextResponse.json(
      { error: "Failed to send test email", details: message },
      { status: 500 }
    );
  }
}

