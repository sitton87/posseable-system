import { NextResponse } from "next/server";
import { query } from "@/db/connection";
import { ensurePermissionResponse } from "@/lib/server/accessControl";

const ENTITY_PAGE_MAP: Record<string, { pageKey: string }> = {
  supplier: { pageKey: "suppliers" },
  donor: { pageKey: "donors" },
  equipment: { pageKey: "equipment" },
  surfer: { pageKey: "surfers" },
  volunteer: { pageKey: "volunteers" },
  activity: { pageKey: "activities" },
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
    
    // Allow "all" or specific type
    if (!entityType) {
      return NextResponse.json(
        { error: "entityType (or entity_type) query parameter is required" },
        { status: 400 }
      );
    }

    if (entityType !== "all") {
      const permission = await ensurePermissionResponse(
        getPermissionKey(entityType),
        "read"
      );
      if (!permission.allowed) return permission.response;
    } else {
      // For "all", we check generic access (e.g. dashboard or admin)
      const permission = await ensurePermissionResponse("dashboard", "read");
      if (!permission.allowed) return permission.response;
    }

    const entityId =
      searchParams.get("entityId") ?? searchParams.get("entity_id");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 200);
    const showArchived = searchParams.get("showArchived") === "true";

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
        n.updated_at,
        n.assigned_to,
        v.full_name as assigned_to_name
      FROM note n
      LEFT JOIN app_user u ON n.created_by = u.national_id
      LEFT JOIN volunteer v ON n.assigned_to = v.national_id
      WHERE 1=1
    `;

    if (entityType !== "all") {
      sql += " AND n.entity_type = @entityType";
    }

    if (entityId) {
      if (entityId === "general") {
         sql += " AND n.entity_id = 'general'";
      } else {
         sql += " AND n.entity_id = @entityId";
      }
    }

    if (showArchived) {
      // Show ONLY deleted OR completed tasks
      // IMPORTANT: status check should be case-insensitive usually, but here we assume standard values
      sql += " AND (n.is_deleted = 1 OR n.status IN ('done', 'cancelled', 'closed'))";
    } else {
      // Default: Show ONLY active tasks (not deleted, not completed)
      sql += " AND (n.is_deleted = 0 OR n.is_deleted IS NULL) AND (n.status NOT IN ('done', 'cancelled', 'closed') OR n.status IS NULL)";
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
      assigned_to,
    } = body;

    if (!entity_type || !entity_id || !title) {
      return NextResponse.json(
        { error: "entity_type, entity_id and title are required" },
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
          created_by,
          assigned_to,
          is_deleted
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
          @created_by,
          @assigned_to,
          0
        )
      `,
      {
        entity_type,
        entity_id: entity_id,
        title,
        body: noteBody || "",
        status: normalizedStatus,
        priority,
        due_date,
        created_by: session.national_id,
        assigned_to: assigned_to || null,
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

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed. Use /api/notes/[id] to update a specific note." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed. Use /api/notes/[id] to delete a specific note." },
    { status: 405 }
  );
}
