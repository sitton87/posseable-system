import { colors } from "@/app/styles/foundations";

export type ConditionOption = {
  value: string;
  label: string;
  badge: { background: string; color: string };
};

export const CONDITION_OPTIONS: ConditionOption[] = [
  {
    value: "new",
    label: "חדש",
    badge: { background: colors.successSoft, color: colors.success },
  },
  {
    value: "used",
    label: "משומש",
    badge: { background: "rgba(251, 191, 36, 0.15)", color: "#c2410c" },
  },
  {
    value: "damaged",
    label: "דורש תיקון",
    badge: { background: colors.dangerSoft, color: colors.danger },
  },
];

export const conditionBadgeMap: Record<
  string,
  { background: string; color: string }
> = CONDITION_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.badge }),
  {}
);

export const getConditionLabel = (value: string) =>
  CONDITION_OPTIONS.find((option) => option.value === value)?.label || value;

export const EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  sea: "ציוד ים",
  support: "ציוד מסייע",
};
