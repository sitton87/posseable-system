import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

type WarehousePayload = {
  id?: string;
  code?: string;
  name: string;
  city?: string | null;
  address_line?: string | null;
  postal_code?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  manager_email?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  rent_cost?: number | null;
  rent_currency?: string | null;
  rent_expiry?: string | null;
  lease_notes?: string | null;
  general_notes?: string | null;
  is_active?: boolean;
};

function normalizePayload(body: WarehousePayload) {
  return {
    code: body.code?.trim(),
    name: body.name?.trim(),
    city: body.city?.trim() || null,
    address_line: body.address_line?.trim() || null,
    postal_code: body.postal_code?.trim() || null,
    manager_name: body.manager_name?.trim() || null,
    manager_phone: body.manager_phone?.trim() || null,
    manager_email: body.manager_email?.trim() || null,
    contact_name: body.contact_name?.trim() || null,
    contact_phone: body.contact_phone?.trim() || null,
    rent_cost:
      typeof body.rent_cost === "number" && !Number.isNaN(body.rent_cost)
        ? body.rent_cost
        : null,
    rent_currency: body.rent_currency?.trim()?.slice(0, 3)?.toUpperCase() || null,
    rent_expiry: body.rent_expiry || null,
    lease_notes: body.lease_notes?.trim() || null,
    general_notes: body.general_notes?.trim() || null,
    is_active: body.is_active ?? true,
  };
}

export async function GET() {
  try {
    const permission = await ensurePermissionResponse("equipment", "read");
    if (!permission.allowed) return permission.response;

    const result = await query(`
      SELECT
        id,
        code,
        name,
        city,
        address_line,
        postal_code,
        manager_name,
        manager_phone,
        manager_email,
        contact_name,
        contact_phone,
        rent_cost,
        rent_currency,
        rent_expiry,
        lease_notes,
        general_notes,
        is_active,
        created_at,
        updated_at
      FROM warehouse
      ORDER BY name
    `);

    return NextResponse.json({
      success: true,
      data: result.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching warehouses:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const permission = await ensurePermissionResponse("equipment", "write");
    if (!permission.allowed) return permission.response;

    const body = (await req.json()) as WarehousePayload;
    const payload = normalizePayload(body);

    if (!payload.name) {
      return NextResponse.json(
        { error: "שם המחסן הוא שדה חובה" },
        { status: 400 }
      );
    }

    let warehouseCode = payload.code;
    if (!warehouseCode) {
      const nextCodeResult = await query(`
        SELECT CAST(ISNULL(MAX(CAST(code AS INT)), 10) + 1 AS VARCHAR(20)) AS next_code
        FROM warehouse
        WHERE ISNUMERIC(code) = 1
      `);
      warehouseCode = nextCodeResult.recordset[0]?.next_code || "11";
    } else if (warehouseCode.length > 20) {
      return NextResponse.json(
        { error: "קוד מחסן חובה (עד 20 תווים)" },
        { status: 400 }
      );
    } else {
      const existing = await query(
        `SELECT TOP 1 id FROM warehouse WHERE code = @code`,
        { code: warehouseCode }
      );
      if (existing.recordset.length) {
        return NextResponse.json(
          { error: "קוד המחסן כבר קיים במערכת" },
          { status: 409 }
        );
      }
    }

    await query(
      `
        INSERT INTO warehouse (
          id,
          code,
          name,
          city,
          address_line,
          postal_code,
          manager_name,
          manager_phone,
          manager_email,
          contact_name,
          contact_phone,
          rent_cost,
          rent_currency,
          rent_expiry,
          lease_notes,
          general_notes,
          is_active,
          created_at,
          updated_at
        )
        VALUES (
          NEWID(),
          @code,
          @name,
          @city,
          @address_line,
          @postal_code,
          @manager_name,
          @manager_phone,
          @manager_email,
          @contact_name,
          @contact_phone,
          @rent_cost,
          @rent_currency,
          @rent_expiry,
          @lease_notes,
          @general_notes,
          @is_active,
          SYSUTCDATETIME(),
          SYSUTCDATETIME()
        )
      `,
      { ...payload, code: warehouseCode }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error creating warehouse:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const permission = await ensurePermissionResponse("equipment", "write");
    if (!permission.allowed) return permission.response;

    const body = (await req.json()) as WarehousePayload;
    if (!body.id) {
      return NextResponse.json(
        { error: "נדרש מזהה מחסן לעדכון" },
        { status: 400 }
      );
    }

    const payload = normalizePayload(body);

    const setClauses = [
      "code = @code",
      "name = @name",
      "city = @city",
      "address_line = @address_line",
      "postal_code = @postal_code",
      "manager_name = @manager_name",
      "manager_phone = @manager_phone",
      "manager_email = @manager_email",
      "contact_name = @contact_name",
      "contact_phone = @contact_phone",
      "rent_cost = @rent_cost",
      "rent_currency = @rent_currency",
      "rent_expiry = @rent_expiry",
      "lease_notes = @lease_notes",
      "general_notes = @general_notes",
      "is_active = @is_active",
      "updated_at = SYSUTCDATETIME()",
    ];

    const params = { ...payload, id: body.id };

    await query(
      `
        UPDATE warehouse
        SET ${setClauses.join(", ")}
        WHERE id = @id
      `,
      params
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating warehouse:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}


