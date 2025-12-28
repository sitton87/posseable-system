import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { findUserByCredentials } from "@/lib/services/authService";
import { ENABLE_DEV_LOGIN } from "@/lib/config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { national_id, email, password, is_dev_login } = body;

    // --- לוגיקת מצב פיתוח (עוקף סיסמה) ---
    if (ENABLE_DEV_LOGIN === "1" && is_dev_login) {
      console.log("⚡ Dev Login Mode Activated");

      // שליפת משתמש כלשהו (למשל המנהל הראשון) כדי ליצור עבורו session
      const devUserRes = await query(`
        SELECT TOP 1 national_id, full_name, role, role_group_code 
        FROM app_user 
        WHERE is_active = 1
        ORDER BY created_at ASC
      `);

      if (!devUserRes.recordset.length) {
        return NextResponse.json({ error: "No users in DB" }, { status: 400 });
      }

      const user = devUserRes.recordset[0];
      const sessionData = {
        national_id: user.national_id,
        role: user.role,
        role_group_code: user.role_group_code ?? "management",
      };

      const cookieStore = await cookies();
      cookieStore.set("session", JSON.stringify(sessionData), {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        maxAge: 60 * 60 * 2,
        path: "/",
      });

      return NextResponse.json({ redirect: "/dashboard" }, { status: 200 });
    }
    // --- סוף לוגיקת פיתוח ---

    console.log("LOGIN INPUT:", {
      national_id,
      email,
      password,
    });

    if (!national_id || !email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    // 1. שליפת המשתמש מה-DB
    const result = await findUserByCredentials(national_id, email);

    if (!result.recordset.length) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const user = result.recordset[0];

    // 2. בדיקת סיסמה
    console.log("LOGIN INPUT:", { national_id, email, password });
    console.log("HASH FROM DB:", user.password_hash);

    const valid = await bcrypt.compare(password, user.password_hash);

    console.log("COMPARE:", password, user.password_hash);
    console.log("COMPARE RESULT:", valid);

    // 3. יצירת session
    const sessionData = {
      national_id: user.national_id,
      role: user.role,
      role_group_code: user.role_group_code ?? "management",
    };

    // שמירת session בתוך cookie
    const cookieStore = await cookies();

    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // בפרודקשן: TRUE
      maxAge: 60 * 60 * 2, // שעתיים
      path: "/",
    });

    // 4. בדיקת כניסה ראשונית
    if (user.must_reset) {
      return NextResponse.json(
        { redirect: "/reset-password" },
        { status: 200 }
      );
    }

    return NextResponse.json({ redirect: "/dashboard" }, { status: 200 });
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
