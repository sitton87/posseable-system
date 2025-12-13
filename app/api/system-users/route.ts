import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import {
  fetchAppUsers,
  findExistingAppUser,
  insertAppUser,
  updateAppUser,
  deleteAppUser,
} from "@/lib/services/systemUserService";
import { sendWelcomeEmail } from "@/lib/services/emailService";
import { hasSystemAdminAccess } from "@/lib/utils/roles";
import { getUserBasicInfo } from "@/lib/services/authService";
import { generateTemporaryPassword } from "@/lib/utils/password";

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
    const parsed = JSON.parse(sessionCookie.value);
    return parsed;
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

export async function GET() {
  const context = await getAdminContext();
  if (!context) {
    return forbiddenResponse();
  }

  try {
    const result = await fetchAppUsers();
    return NextResponse.json({
      success: true,
      users: result.recordset,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch users", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const context = await getAdminContext();
  if (!context) {
    return forbiddenResponse();
  }

  try {
    const body = await req.json();
    const {
      national_id,
      full_name,
      email,
      role,
      must_reset,
      role_group_code,
    } = body;

    if (
      !national_id ||
      !/^\d{9}$/.test(national_id) ||
      !full_name ||
      !email ||
      !role
    ) {
      return NextResponse.json(
        {
          error:
            "national_id (9 digits), full_name, email and role are required",
        },
        { status: 400 }
      );
    }

    const existing = await findExistingAppUser({ national_id, email });
    if (existing.recordset.length) {
      return NextResponse.json(
        { error: "User with same ID or email already exists" },
        { status: 409 }
      );
    }

    const temporaryPassword = generateTemporaryPassword();
    const password_hash = await bcrypt.hash(temporaryPassword, 10);

    await insertAppUser({
      national_id,
      full_name,
      email,
      password_hash,
      role,
      must_reset: must_reset ?? true,
      role_group_code,
    });

    let emailSent = false;
    try {
      await sendWelcomeEmail({
        to: email,
        fullName: full_name,
        temporaryPassword,
        nationalId: national_id,
      });
      emailSent = true;
    } catch (mailError) {
      console.error("Failed to send welcome email", mailError);
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to create user", error);
    return NextResponse.json(
      { error: "Failed to create user", details: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const context = await getAdminContext();
  if (!context) {
    return forbiddenResponse();
  }

  try {
    const body = await req.json();
    const {
      national_id,
      full_name,
      email,
      role,
      must_reset,
      reset_password,
      role_group_code,
      is_active,
    } = body;

    if (!national_id) {
      return NextResponse.json(
        { error: "national_id is required" },
        { status: 400 }
      );
    }

    const updates: {
      full_name?: string;
      email?: string;
      role?: string;
      role_group_code?: string;
      must_reset?: boolean;
      password_hash?: string;
      is_active?: boolean;
    } = {};

    if (typeof full_name === "string") updates.full_name = full_name;
    if (typeof email === "string") updates.email = email;
    if (typeof role === "string") updates.role = role;
    if (typeof role_group_code === "string") {
      updates.role_group_code = role_group_code;
    }

    if (typeof must_reset === "boolean") updates.must_reset = must_reset;
    if (typeof is_active === "boolean") updates.is_active = is_active;

    if (typeof reset_password === "string" && reset_password.trim()) {
      updates.password_hash = await bcrypt.hash(reset_password.trim(), 10);
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { error: "No updates supplied" },
        { status: 400 }
      );
    }

    await updateAppUser(national_id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to update user", error);
    return NextResponse.json(
      { error: "Failed to update user", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const context = await getAdminContext();
  if (!context) {
    return forbiddenResponse();
  }

  try {
    const { searchParams } = new URL(req.url);
    const national_id = searchParams.get("national_id");

    if (!national_id) {
      return NextResponse.json(
        { error: "national_id is required" },
        { status: 400 }
      );
    }

    if (national_id === context.session.national_id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    await deleteAppUser(national_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to delete user", error);
    return NextResponse.json(
      { error: "Failed to delete user", details: message },
      { status: 500 }
    );
  }
}
