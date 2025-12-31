import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserBasicInfo } from "@/lib/services/authService";
import { decryptSession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // פענוח ה-Token המוצפן (במקום JSON.parse)
    const session = await decryptSession(sessionCookie.value);

    const userResult = await getUserBasicInfo(session.national_id);
    if (!userResult.recordset.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.recordset[0];

    return NextResponse.json({
      success: true,
      user: {
        national_id: user.national_id,
        full_name: user.full_name,
        role: user.role,
        role_group_code: user.role_group_code,
      },
    });
  } catch (err: any) {
    console.error("Error fetching user info:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
