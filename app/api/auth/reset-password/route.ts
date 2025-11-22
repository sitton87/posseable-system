import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { national_id, old_password, new_password } = await req.json();

    if (!national_id || !old_password || !new_password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // בדיקת חוזק סיסמה חדשה
    const strong = /^(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strong.test(new_password)) {
      return NextResponse.json(
        {
          error: "הסיסמה חייבת לכלול 8 תווים, אותיות באנגלית, מספר ותו מיוחד.",
        },
        { status: 400 }
      );
    }

    // שליפת המשתמש
    const result = await query(
      "SELECT national_id, password_hash, must_reset FROM app_user WHERE national_id = @id",
      { id: national_id }
    );

    if (!result.recordset.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.recordset[0];

    // בדיקת סיסמה ישנה
    const valid = await bcrypt.compare(old_password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "סיסמה נוכחית שגויה" },
        { status: 401 }
      );
    }

    // הפקת סיסמה חדשה
    const newHash = await bcrypt.hash(new_password, 10);

    // עדכון בבסיס הנתונים
    await query(
      "UPDATE app_user SET password_hash = @newHash, must_reset = 0 WHERE national_id = @id",
      { newHash, id: national_id }
    );

    // יצירת session חדש
    const sessionData = {
      national_id: user.national_id,
      role: "User",
    };

    const cookieStore = await cookies();

    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // בפרודקשן: TRUE
      maxAge: 60 * 60 * 2, // שעתיים
      path: "/",
    });

    return NextResponse.json({ redirect: "/dashboard" });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
