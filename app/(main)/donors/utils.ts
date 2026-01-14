import { DonorFormState, DonorStats, DonorTask } from "./types";
import { Donor } from "@/type";

export const createEmptyDonorForm = (): DonorFormState => ({
  national_id: "",
  full_name: "",
  organization: "",
  phone: "",
  email: "",
  notes: "",
  is_active: true,
});

export const defaultStats: DonorStats = {
  total_donors: 0,
  active_donors: 0,
  total_donation_events: 0,
  total_donations: 0,
  highest_donation: 0,
  average_donation: 0,
};

export const TASK_STATUSES = [
  { value: "not-started", label: "לא התחיל", tone: "warning" as const },
  { value: "in-progress", label: "בתהליך", tone: "info" as const },
  { value: "done", label: "הסתיים", tone: "success" as const },
  { value: "cancelled", label: "בוטל", tone: "danger" as const },
] as const;

export const normalizeStatus = (value?: string | null) => {
  if (!value) return "not-started";
  if (value === "pending" || value === "open") return "not-started";
  return TASK_STATUSES.some((s) => s.value === value) ? value : "not-started";
};

export const nextStatus = (current: string) => {
  const norm = normalizeStatus(current);
  const idx = TASK_STATUSES.findIndex((s) => s.value === norm);
  return TASK_STATUSES[(idx + 1) % TASK_STATUSES.length].value;
};

export const formatCurrency = (value?: number | null) => {
  const num = typeof value === "number" ? value : 0;
  return `₪${num.toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

export const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const generateDraftId = () =>
  typeof window !== "undefined" && window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const buildTasks = (donors: Donor[]): DonorTask[] => {
  const tasks: DonorTask[] = [];

  donors
    .filter((donor) => (donor.total_donations || 0) === 0)
    .slice(0, 3)
    .forEach((donor) =>
      tasks.push({
        id: `new-${donor.national_id}`,
        donorName: donor.full_name,
        summary: "שיחת הכרות עם תורם חדש",
        dueDate: null,
        status: "pending",
        emphasis: "call",
      })
    );

  const staleDonors = donors.filter((donor) => {
    if (!donor.last_donation_date) return false;
    const last = new Date(donor.last_donation_date);
    if (Number.isNaN(last.getTime())) return false;
    const diffDays = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 180;
  });

  staleDonors.slice(0, 3).forEach((donor) => {
    let dueDate: string | null = null;
    const lastVal = donor.last_donation_date;
    if (lastVal) {
      const parsed =
        lastVal instanceof Date ? lastVal : new Date(lastVal as string);
      if (!Number.isNaN(parsed.getTime())) {
        dueDate = parsed.toISOString();
      }
    }

    tasks.push({
      id: `follow-${donor.national_id}`,
      donorName: donor.full_name,
      summary: "תיאום שיחת עדכון על פעילות הארגון",
      dueDate,
      status: "pending",
      emphasis: "meet",
    });
  });

  donors
    .filter((donor) => (donor.total_donations || 0) > 20000)
    .slice(0, 2)
    .forEach((donor) =>
      tasks.push({
        id: `thanks-${donor.national_id}`,
        donorName: donor.full_name,
        summary: "שליחת מכתב תודה אישי",
        dueDate: null,
        status: "pending",
        emphasis: "thank-you",
      })
    );

  return tasks;
};
