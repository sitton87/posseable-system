import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { query } from "@/db/connection";
import { sendWelcomeEmail } from "@/lib/services/emailService";

const TEMP_PASSWORD_LENGTH = 8;
const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PASSWORD_PREFIX = "POS";

function generateTemporaryPassword() {
  let suffix = "";
  const bytes = randomBytes(TEMP_PASSWORD_LENGTH);
  for (let i = 0; i < bytes.length; i++) {
    const index = bytes[i] % PASSWORD_CHARS.length;
    suffix += PASSWORD_CHARS[index];
  }
  return `${PASSWORD_PREFIX}${suffix}`;
}

export async function POST(req: Request) {
  try {
    const { national_id, email } = await req.json();

    if (!national_id || !email) {
      return NextResponse.json(
        { error: "יש להזין תעודת זהות וכתובת דוא\"ל" },
        { status: 400 }
      );
    }

    if (!/^\d{9}$/.test(national_id)) {
      return NextResponse.json(
        { error: "תעודת זהות חייבת להכיל 9 ספרות" },
        { status: 400 }
      );
    }

    const userResult = await query(
      `SELECT national_id, full_name, email
       FROM app_user
       WHERE national_id = @id AND email = @mail`,
      { id: national_id, mail: email }
    );

    if (!userResult.recordset.length) {
      // Don't reveal that user not found
      return NextResponse.json({
        success: true,
        message: "אם הפרטים קיימים במערכת תישלח סיסמה חדשה לאימייל",
      });
    }

    const user = userResult.recordset[0];
    const temporaryPassword = generateTemporaryPassword();
    const password_hash = await bcrypt.hash(temporaryPassword, 10);

    await query(
      `UPDATE app_user SET password_hash = @hash, must_reset = 1 WHERE national_id = @id`,
      { hash: password_hash, id: user.national_id }
    );

    try {
      await sendWelcomeEmail({
        to: user.email,
        fullName: user.full_name,
        nationalId: user.national_id,
        temporaryPassword,
        context: "reset",
      });
    } catch (emailErr) {
      console.error("Failed to send password reset email", emailErr);
      // still return success to avoid leaking info
    }

    return NextResponse.json({
      success: true,
      message: "אם הפרטים תואמים, נשלחה אליך סיסמה זמנית חדשה.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה. נסה שוב מאוחר יותר." },
      { status: 500 }
    );
  }
}

