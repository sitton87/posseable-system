"use client";

import {
  type CreateNotePayload,
  type Note,
  type NoteStatus,
  type UpdateNotePayload,
} from "@/type";

export const NOTE_STATUSES: NoteStatus[] = [
  "open",
  "in_progress",
  "done",
  "cancelled",
];

export const normalizeStatus = (value?: string | null): NoteStatus => {
  const v = (value || "").toLowerCase();
  if (v === "pending") return "open";
  if (v === "closed") return "done";
  return NOTE_STATUSES.includes(v as NoteStatus) ? (v as NoteStatus) : "open";
};

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: "Invalid JSON from server", raw: text };
  }
}

export async function getNotes(params: {
  entity_type: string;
  entity_id?: string;
  limit?: number;
}): Promise<Note[]> {
  const search = new URLSearchParams();
  search.set("entityType", params.entity_type);
  if (params.entity_id) search.set("entityId", params.entity_id);
  if (params.limit) search.set("limit", String(params.limit));

  const res = await fetch(`/api/notes?${search.toString()}`, {
    credentials: "include",
  });
  const data = await parseJson(res);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || "Failed to load notes");
  }
  const notes = (data.notes || []) as Note[];
  return notes.map((n) => ({ ...n, status: normalizeStatus(n.status) }));
}

export async function createNote(payload: CreateNotePayload) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || "Failed to create note");
  }
  const note = data.note as Note;
  return { ...note, status: normalizeStatus(note.status) };
}

export async function updateNote(noteId: string, payload: UpdateNotePayload) {
  const res = await fetch(`/api/notes/${noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await parseJson(res);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || "Failed to update note");
  }
  return true;
}

export async function deleteNote(noteId: string) {
  const res = await fetch(`/api/notes/${noteId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await parseJson(res);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || "Failed to delete note");
  }
  return true;
}

