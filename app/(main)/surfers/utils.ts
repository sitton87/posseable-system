import { SurferStats } from "@/type";
import { SurferFormState, TaskFormState } from "./types";
import { DraftType } from "@/app/hooks/useDraftManager";

export const surferDraftType: DraftType = "surfer";

export const calcAge = (dateStr?: string | null) => {
  if (!dateStr) return null;
  const dob = new Date(dateStr);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : null;
};

export const defaultStats: SurferStats = {
  total: 0,
  active: 0,
  approved: 0,
  pending: 0,
  medicalApproved: 0,
  wheelchair: 0,
  grouped: 0,
  // Add missing properties to match SurferStats type if necessary,
  // or ensure SurferStats matches this structure.
  // Assuming SurferStats definition from project (not visible here but inferred).
};

export const createEmptyForm = (): SurferFormState => ({
  national_id: "",
  full_name: "",
  phone: "",
  email: "",
  residence: "",
  age: "",
  date_of_birth: "",
  gender: "",
  status: "בהמתנה",
  program: "",
  group_id: "",
  medical_approval: false,
  medical_condition: "",
  needs_wheelchair: false,
  volunteers_needed: "",
  special_requirements: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  active: true,
  notes: "",
});

export const createEmptyTaskForm = (): TaskFormState => ({
  surfer_id: "",
  title: "",
  body: "",
  due_date: "",
});

export const generateDraftId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `surfer-${window.crypto.randomUUID()}`;
  }
  return `surfer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

