"use server";

import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

const ENTITY_PAGE_MAP: Record<string, string> = {
  supplier: "suppliers",
  donor: "donors",
  equipment: "equipment",
  surfer: "surfers",
};

function getPageKey(entityType: string | null | undefined) {
  if (!entityType) return "dashboard";
  return ENTITY_PAGE_MAP[entityType.toLowerCase()] ?? "dashboard";
}

const ALLOWED_STATUSES = new Set([
  "open",
  "in_progress",
  "done",
  "cancelled",
  "closed", // legacy
  "pending", // legacy
]);

function normalizeStatus(raw?: string | null) {
  if (!raw) return undefined;
  const value = raw.toLowerCase();
  if (value === "pending") return "open";
  if (ALLOWED_STATUSES.has(value)) return value;
  return "open";
}

export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = params.noteId;
    if (!noteId) {
      return NextResponse.json(
        { error: "noteId is required" },
        { status: 400 }
      );
    }

    const existing = await query(
      `SELECT entity_type, status FROM note WHERE note_id = @note_id`,
      { note_id: noteId }
    );

    if (!existing.recordset.length) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const entityType = existing.recordset[0].entity_type as string;
    const oldStatus = existing.recordset[0].status as string | null;

    const permission = await ensurePermissionResponse(
      getPageKey(entityType),
      "write"
    );
    if (!permission.allowed) return permission.response;

    const body = await req.json();
    const { status, title, due_date, body: noteBody, priority } = body;

    if (!status && !title && !due_date && !noteBody && !priority) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const normalizedStatus = normalizeStatus(status);
    const hasStatusChange =
      normalizedStatus !== undefined && normalizedStatus !== oldStatus;

    await query(
      `
        UPDATE note
        SET
          status = COALESCE(@status, status),
          title = COALESCE(@title, title),
          body = COALESCE(@noteBody, body),
          due_date = COALESCE(@due_date, due_date),
          priority = COALESCE(@priority, priority),
          updated_by = @updated_by,
          updated_at = SYSUTCDATETIME()
        WHERE note_id = @note_id
      `,
      {
        note_id: noteId,
        status: normalizedStatus ?? null,
        title,
        noteBody,
        due_date,
        priority,
        updated_by: permission.session?.national_id ?? null,
      }
    );

    if (hasStatusChange) {
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
          note_id: noteId,
          old_status: oldStatus,
          new_status: normalizedStatus,
          changed_by: permission.session?.national_id ?? null,
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating note:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = params.noteId;
    if (!noteId) {
      return NextResponse.json(
        { error: "noteId is required" },
        { status: 400 }
      );
    }

    const existing = await query(
      `SELECT entity_type FROM note WHERE note_id = @note_id`,
      { note_id: noteId }
    );

    if (!existing.recordset.length) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const entityType = existing.recordset[0].entity_type as string;
    const permission = await ensurePermissionResponse(
      getPageKey(entityType),
      "write"
    );
    if (!permission.allowed) return permission.response;

    await query(`DELETE FROM note WHERE note_id = @note_id`, {
      note_id: noteId,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting note:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}
