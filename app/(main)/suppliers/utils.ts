import { NoteStatus } from "@/type";
import { FormState, TaskFormState, identifierTypeOptions } from "./types";

export const normalizeStatus = (value?: string | null): NoteStatus => {
  if (!value) return "open";
  const v = value.toLowerCase();
  if (v === "pending") return "open";
  if (v === "closed") return "done";
  return ["open", "in_progress", "done", "cancelled"].includes(v)
    ? (v as NoteStatus)
    : "open";
};

export const createEmptyFormState = (): FormState => ({
  supplier_identifier: "",
  identifier_type: identifierTypeOptions[0].value,
  supplier_type: "goods",
  services_offered: "",
  has_active_contract: false,
  name: "",
  contact_name: "",
  phone: "",
  email: "",
  notes: "",
  is_active: true,
});

export const createEmptyTaskForm = (): TaskFormState => ({
  supplier_identifier: "",
  title: "",
  body: "",
  due_date: "",
});

export const generateDraftId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `supplier-${window.crypto.randomUUID()}`;
  }
  return `supplier-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

