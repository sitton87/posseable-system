"use server";

import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

const ENTITY_PAGE_MAP: Record<string, string> = {
  supplier: "suppliers",
  donor: "donors",
  equipment: "equipment",
};

function getPageKey(entityType: string | null | undefined) {
  if (!entityType) return "dashboard";
  return ENTITY_PAGE_MAP[entityType.toLowerCase()] ?? "dashboard";
}

export async function PATCH(
  req: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = params.noteId;
    if (!noteId) {
      return NextResponse.json({ error: "noteId is required" }, { status: 400 });
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

    const body = await req.json();
    const { status, title, due_date } = body;

    if (!status && !title && !due_date) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    await query(
      `
        UPDATE note
        SET
          status = COALESCE(@status, status),
          title = COALESCE(@title, title),
          due_date = COALESCE(@due_date, due_date),
          updated_by = @updated_by,
          updated_at = SYSUTCDATETIME()
        WHERE note_id = @note_id
      `,
      {
        note_id: noteId,
        status,
        title,
        due_date,
        updated_by: permission.session?.national_id ?? null,
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error updating note:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

