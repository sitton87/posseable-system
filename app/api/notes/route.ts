"use server";

import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

const ENTITY_PAGE_MAP: Record<string, { pageKey: string }> = {
  supplier: { pageKey: "suppliers" },
  donor: { pageKey: "donors" },
  equipment: { pageKey: "equipment" },
  surfer: { pageKey: "surfers" },
  volunteer: { pageKey: "volunteers" },
};

function getPermissionKey(entityType: string) {
  const config = ENTITY_PAGE_MAP[entityType.toLowerCase()];
  return config?.pageKey ?? "dashboard";
}

const ALLOWED_STATUSES = new Set([
  "open",
  "in_progress",
  "done",
  "cancelled",
  "closed", // legacy
  "pending", // legacy -> normalize to open
  "not_started",
  "postponed",
]);

function normalizeStatus(raw?: string | null) {
  if (!raw) return "not_started";
  const value = raw.toLowerCase();
  if (value === "pending") return "open";
  if (ALLOWED_STATUSES.has(value)) return value;
  return "not_started";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entityType =
      searchParams.get("entityType") ?? searchParams.get("entity_type");
    if (!entityType) {
      return NextResponse.json(
        { error: "entityType (or entity_type) query parameter is required" },
        { status: 400 }
      );
    }
    const permission = await ensurePermissionResponse(
      getPermissionKey(entityType),
      "read"
    );
    if (!permission.allowed) return permission.response;

    const entityId =
      searchParams.get("entityId") ?? searchParams.get("entity_id");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 200);

    let sql = `
      SELECT TOP (@limit)
        n.note_id,
        n.entity_type,
        n.entity_id,
        n.title,
        n.body,
        n.status,
        n.priority,
        n.due_date,
        n.created_by,
        u.full_name as created_by_name,
        n.created_at,
        n.updated_by,
        n.updated_at
      FROM note n
      LEFT JOIN app_user u ON n.created_by = u.national_id
      WHERE n.entity_type = @entityType
    `;

    if (entityId) {
      sql += " AND n.entity_id = @entityId";
    }

    sql += " ORDER BY n.created_at DESC";

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
      status = "not_started",
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
    const normalizedStatus = normalizeStatus(status);

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
        status: normalizedStatus,
        priority,
        due_date,
        created_by: session.national_id,
      }
    );

    const note = insertResult.recordset[0];

    // Write initial status history
    await query(
      `
        INSERT INTO note_status_history (
          note_id,
          old_status,
          new_status,
          changed_by,
          changed_at
        )
        VALUES (@note_id, @old_status, @new_status, @changed_by, SYSUTCDATETIME())
      `,
      {
        note_id: note.note_id,
        old_status: null,
        new_status: normalizedStatus,
        changed_by: session.national_id,
      }
    );

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (err: any) {
    console.error("Error creating note:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
