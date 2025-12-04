import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

type CategoryPayload = {
  family_code: string;
  code: string;
  name: string;
  description?: string | null;
  enforce_sku?: boolean;
  require_image?: boolean;
};

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("equipment", "write");
    if (!permission.allowed) return permission.response;

    const body: CategoryPayload = await req.json();
    const familyCode = body.family_code?.trim().toUpperCase();
    const categoryCode = body.code?.trim().toUpperCase();
    const name = body.name?.trim();

    if (!familyCode || familyCode.length !== 2) {
      return NextResponse.json(
        { error: "יש לבחור קוד משפחה תקין (2 תווים)" },
        { status: 400 }
      );
    }

    if (!categoryCode || categoryCode.length !== 2) {
      return NextResponse.json(
        { error: "קוד קטגוריה חייב להיות באורך 2 תווים" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "שם הקטגוריה הוא שדה חובה" },
        { status: 400 }
      );
    }

    const familyResult = await query(
      `SELECT TOP 1 code FROM equipment_family WHERE code = @code`,
      { code: familyCode }
    );
    if (!familyResult.recordset.length) {
      return NextResponse.json(
        { error: "משפחה לא נמצאה במערכת" },
        { status: 400 }
      );
    }

    const categoryResult = await query(
      `
        SELECT TOP 1 code
        FROM equipment_category
        WHERE family_code = @family_code
          AND code = @code
      `,
      { family_code: familyCode, code: categoryCode }
    );

    if (categoryResult.recordset.length) {
      return NextResponse.json(
        { error: "קוד קטגוריה כבר קיים במשפחה זו" },
        { status: 409 }
      );
    }

    await query(
      `
        INSERT INTO equipment_category (
          family_code,
          code,
          name,
          description,
          enforce_sku,
          require_image,
          is_active,
          created_at,
          updated_at
        )
        VALUES (
          @family_code,
          @code,
          @name,
          @description,
          @enforce_sku,
          @require_image,
          1,
          SYSUTCDATETIME(),
          SYSUTCDATETIME()
        )
      `,
      {
        family_code: familyCode,
        code: categoryCode,
        name,
        description: body.description || null,
        enforce_sku: body.enforce_sku ? 1 : 0,
        require_image: body.require_image ? 1 : 0,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error creating equipment category:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}



