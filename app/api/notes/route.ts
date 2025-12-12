"use server";

import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

const ENTITY_PAGE_MAP: Record<string, { pageKey: string }> = {
  supplier: { pageKey: "suppliers" },
  donor: { pageKey: "donors" },
  equipment: { pageKey: "equipment" },
  surfer: { pageKey: "surfers" },
};

function getPermissionKey(entityType: string) {
  const config = ENTITY_PAGE_MAP[entityType.toLowerCase()];
  return config?.pageKey ?? "dashboard";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    if (!entityType) {
      return NextResponse.json(
        { error: "entityType query parameter is required" },
        { status: 400 }
      );
    }
    const permission = await ensurePermissionResponse(
      getPermissionKey(entityType),
      "read"
    );
    if (!permission.allowed) return permission.response;

    const entityId = searchParams.get("entityId");
    const limit = Math.min(
      Number(searchParams.get("limit") ?? 50) || 50,
      200
    );

    let sql = `
      SELECT TOP (@limit)
        note_id,
        entity_type,
        entity_id,
        title,
        body,
        status,
        priority,
        due_date,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM note
      WHERE entity_type = @entityType
    `;

    if (entityId) {
      sql += " AND entity_id = @entityId";
    }

    sql += " ORDER BY created_at DESC";

    const result = await query(sql, {
      limit,
      entityType,
      entityId,
    });

    return NextResponse.json({ success: true, notes: result.recordset || [] });
  } catch (err: any) {
    console.error("Error fetching notes:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      entity_type,
      entity_id,
      title,
      body: noteBody,
      status = "open",
      priority = "normal",
      due_date,
    } = body;

    if (!entity_type || !entity_id || !noteBody) {
      return NextResponse.json(
        { error: "entity_type, entity_id and body are required" },
        { status: 400 }
      );
    }

    const permission = await ensurePermissionResponse(
      getPermissionKey(entity_type),
      "write"
    );
    if (!permission.allowed) return permission.response;

    const session = permission.session!;

    const insertResult = await query(
      `
        INSERT INTO note (
          entity_type,
          entity_id,
          title,
          body,
          status,
          priority,
          due_date,
          created_by
        )
        OUTPUT INSERTED.*
        VALUES (
          @entity_type,
          @entity_id,
          @title,
          @body,
          @status,
          @priority,
          @due_date,
          @created_by
        )
      `,
      {
        entity_type,
        entity_id,
        title,
        body: noteBody,
        status,
        priority,
        due_date,
        created_by: session.national_id,
      }
    );

    return NextResponse.json({
      success: true,
      note: insertResult.recordset[0],
    });
  } catch (err: any) {
    console.error("Error creating note:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

