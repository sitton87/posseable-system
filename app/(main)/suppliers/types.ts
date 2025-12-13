import {
  Note,
  NoteStatus,
  Supplier,
  SupplierActivityLog,
  SupplierStats,
} from "@/type";

export const identifierTypeOptions = [
  { value: "HP", label: "ח.פ" },
  { value: "OSEK", label: "עוסק מורשה" },
  { value: "ID", label: "ת.ז" },
  { value: "OTHER", label: "אחר" },
] as const;

export const supplierTypeOptions = [
  { value: "goods", label: "ספק ציוד" },
  { value: "services", label: "בעל מקצוע" },
  { value: "both", label: "שירותים + ציוד" },
] as const;

export type IdentifierType = (typeof identifierTypeOptions)[number]["value"];
export type SupplierType = (typeof supplierTypeOptions)[number]["value"];

export type FormState = {
  supplier_identifier: string;
  identifier_type: IdentifierType;
  supplier_type: SupplierType;
  services_offered: string;
  has_active_contract: boolean;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  notes: string;
  is_active: boolean;
};

export type SupplierFilters = {
  search: string;
  status: "all" | "active" | "inactive";
  type: "all" | SupplierType;
};

export type TaskFormState = {
  supplier_identifier: string;
  title: string;
  body: string;
  due_date: string;
};

export type SupplierSummaryData = {
  stats: SupplierStats;
  tasks: Note[];
  recentActivity: SupplierActivityLog[];
};

