import { CSSProperties } from "react";
import { TransactionFormData } from "./types";
import { cssVar, numericValues } from "@/app/styles/design-system";

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("he-IL") : "—";

export const formatCurrency = (value?: number | null) =>
  typeof value === "number" ? `₪${value.toLocaleString()}` : "—";

export const TRANSACTION_TYPES = ["income", "expense"] as const;
export const INCOME_CATEGORIES = ["תרומה", "מענק", "מכירת ציוד", "אחר"] as const;
export const EXPENSE_CATEGORIES = [
  "ציוד",
  "תחזוקה",
  "שכר",
  "ביטוח",
  "שכירות",
  "דלק",
  "אחר",
] as const;

export const createEmptyFormData = (): TransactionFormData => ({
  transaction_date: new Date().toISOString().split("T")[0],
  type: "expense",
  category: "",
  amount: "",
  description: "",
  supplier_id: "",
  notes: "",
  linkToActivity: false,
  season_id: "",
  activity_id: "",
  paid_by: "",
  payment_details: "",
  has_invoice: false,
  invoice_number: "",
  attachment: null,
  remove_attachment: false,
  donor_shares: [],
});
