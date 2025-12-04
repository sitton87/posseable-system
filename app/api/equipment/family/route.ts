import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

type FamilyPayload = {
  code: string;
  name: string;
  description?: string | null;
  equipment_type: string;
  allow_item_images?: boolean;
  allow_consumables?: boolean;
};

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("equipment", "write");
    if (!permission.allowed) return permission.response;

    const body: FamilyPayload = await req.json();
    const normalizedCode = body.code?.trim().toUpperCase();
    const name = body.name?.trim();
    const equipmentType = body.equipment_type?.trim().toLowerCase();

    if (!normalizedCode || normalizedCode.length !== 2) {
      return NextResponse.json(
        { error: "קוד משפחה חייב להיות באורך 2 תווים" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "שם המשפחה הוא שדה חובה" },
        { status: 400 }
      );
    }

    if (!equipmentType || !["sea", "support"].includes(equipmentType)) {
      return NextResponse.json(
        { error: "סוג הציוד חייב להיות sea או support" },
        { status: 400 }
      );
    }

    const existing = await query(
      `SELECT TOP 1 code FROM equipment_family WHERE code = @code`,
      { code: normalizedCode }
    );
    if (existing.recordset.length) {
      return NextResponse.json(
        { error: "קוד משפחה כבר קיים במערכת" },
        { status: 409 }
      );
    }

    await query(
      `
        INSERT INTO equipment_family (
          code,
          name,
          description,
          equipment_type,
          allow_item_images,
          allow_consumables,
          is_active,
          created_at,
          updated_at
        )
        VALUES (
          @code,
          @name,
          @description,
          @equipment_type,
          @allow_item_images,
          @allow_consumables,
          1,
          SYSUTCDATETIME(),
          SYSUTCDATETIME()
        )
      `,
      {
        code: normalizedCode,
        name,
        description: body.description || null,
        equipment_type: equipmentType,
        allow_item_images: body.allow_item_images ? 1 : 0,
        allow_consumables:
          body.allow_consumables === undefined || body.allow_consumables
            ? 1
            : 0,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error creating equipment family:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}



