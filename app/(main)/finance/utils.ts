import { colors, radii, spacing } from "@/app/styles/foundations";
import { CSSProperties } from "react";
import { TransactionFormData } from "./types";

export const muted = colors.textMuted;
export const px = (value: number) => `${value}px`;

export const sectionBoxStyle: CSSProperties = {
  marginBottom: spacing.lg,
  padding: spacing.lg,
  background: colors.surfaceAlt,
  borderRadius: radii.card,
};

export const smallButtonStyle: CSSProperties = {
  fontSize: 12,
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
};

export const typePillStyle = (type: "income" | "expense"): CSSProperties => ({
  padding: "4px 8px",
  borderRadius: radii.button,
  fontSize: 12,
  fontWeight: 600,
  background: type === "income" ? colors.successSoft : colors.dangerSoft,
  color: type === "income" ? colors.success : colors.danger,
});

export const summaryCardStyle = (bg: string, color: string): CSSProperties => ({
  padding: spacing.lg,
  background: bg,
  borderRadius: radii.card,
  color,
  textAlign: "center",
});

export const dashedBoxStyle: CSSProperties = {
  padding: spacing.md,
  borderRadius: radii.card,
  background: colors.surfaceAlt,
  border: `1px dashed ${colors.borderMuted}`,
};

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

