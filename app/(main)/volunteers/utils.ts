import { NoteStatus } from "@/type";
import { Volunteer, VolunteerFormState, VolunteerStats } from "./types";

export const volunteerDraftType = "volunteer";

export const defaultStats: VolunteerStats = {
  total: 0,
  active: 0,
  staff: 0,
  management: 0,
};

export const TASK_STATUSES: { value: NoteStatus; label: string; tone: string }[] = [
  { value: "open", label: "פתוח", tone: "warning" },
  { value: "in_progress", label: "בתהליך", tone: "info" },
  { value: "done", label: "הסתיים", tone: "success" },
  { value: "cancelled", label: "בוטל", tone: "danger" },
];

export const normalizeStatus = (value?: string | null): NoteStatus => {
  if (!value) return "open";
  const v = value.toLowerCase();
  if (v === "pending") return "open";
  if (v === "closed") return "done";
  return TASK_STATUSES.some((s) => s.value === v) ? (v as NoteStatus) : "open";
};

export const nextStatus = (current: NoteStatus) => {
  const idx = TASK_STATUSES.findIndex((s) => s.value === current);
  return TASK_STATUSES[(idx + 1) % TASK_STATUSES.length].value;
};

export type SafeJsonResult =
  | { success: false; error: string; raw: string }
  | (Record<string, any> & { success?: boolean });

export const tryParseJson = async (res: Response): Promise<SafeJsonResult> => {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!res.ok) {
    return {
      success: false,
      error: `HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`,
      raw: text,
    };
  }

  if (!contentType.includes("application/json")) {
    return {
      success: false,
      error: `Invalid JSON (content-type: ${
        contentType || "unknown"
      }): ${text.slice(0, 200)}`,
      raw: text,
    };
  }

  try {
    return JSON.parse(text);
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to parse JSON: ${err?.message || "unknown error"}`,
      raw: text,
    };
  }
};

export const deriveStatsFromVolunteers = (items: Volunteer[]): VolunteerStats => {
  const total = items.length;
  const active = items.filter((v) => v.active).length;
  const staff = items.filter((v) => v.classification === "staff").length;
  const management = items.filter((v) => v.classification === "management").length;
  return { total, active, staff, management };
};

export const createEmptyForm = (): VolunteerFormState => ({
  national_id: "",
  full_name: "",
  phone: "",
  email: "",
  street: "",
  house_number: "",
  city: "",
  active: true,
  notes: "",
  classification: "volunteer",
  volunteer_type: "",
  profession: "",
  availability: "",
});
