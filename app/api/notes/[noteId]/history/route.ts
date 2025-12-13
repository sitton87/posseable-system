import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

// Copy mapping from note routes for consistency
const ENTITY_PAGE_MAP: Record<string, string> = {
  supplier: "suppliers",
  donor: "donors",
  equipment: "equipment",
  surfer: "surfers",
  volunteer: "volunteers",
};

function getPageKey(entityType: string | null | undefined) {
  if (!entityType) return "dashboard";
  return ENTITY_PAGE_MAP[entityType.toLowerCase()] ?? "dashboard";
}

export async function GET(
  req: Request,
  props: { params: Promise<{ noteId: string }> }
) {
  try {
    const params = await props.params;
    const noteId = params.noteId;

    if (!noteId) {
      return NextResponse.json(
        { error: "noteId is required" },
        { status: 400 }
      );
    }

    // 1. Check existence and permissions based on parent note
    const noteResult = await query(
      "SELECT entity_type FROM note WHERE note_id = @noteId",
      { noteId }
    );

    if (noteResult.recordset.length === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const entityType = noteResult.recordset[0].entity_type;
    const permission = await ensurePermissionResponse(
      getPageKey(entityType),
      "read"
    );

    if (!permission.allowed) return permission.response;

    // 2. Fetch History with User Names
    const historyResult = await query(
      `
      SELECT 
        h.id,
        h.old_status,
        h.new_status,
        h.changed_at,
        h.changed_by,
        u.full_name as changed_by_name
      FROM note_status_history h
      LEFT JOIN app_user u ON h.changed_by = u.national_id
      WHERE h.note_id = @noteId
      ORDER BY h.changed_at DESC
      `,
      { noteId }
    );

    return NextResponse.json({
      success: true,
      history: historyResult.recordset,
    });
  } catch (err: any) {
    console.error("Error fetching note history:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
}

