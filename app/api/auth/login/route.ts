import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { national_id, email, password } = await req.json();

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
    const result = await query(
      "SELECT national_id, full_name, email, password_hash, must_reset, role FROM app_user WHERE national_id = @id AND email = @mail",
      { id: national_id, mail: email }
    );

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
