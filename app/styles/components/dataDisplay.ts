import type { CSSProperties } from "react";
import { colors, radii, shadows, spacing, typography } from "../foundations";

const px = (value: number) => `${value}px`;

export const statCardStyle: CSSProperties = {
  flex: "1 1 220px",
  minWidth: 220,
  padding: px(spacing.lg),
  borderRadius: radii.card,
  boxShadow: shadows.card,
  background: colors.surface,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: spacing.xs,
};

export const badgeStyle = (background: string, color: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
  borderRadius: radii.button,
  fontSize: 12,
  fontWeight: typography.headingsWeight,
  background,
  color,
});

export const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

export const tableHeaderStyle: CSSProperties = {
  textAlign: "center",
  padding: px(spacing.sm),
  color: colors.textMuted,
  fontSize: 13,
  fontWeight: typography.headingsWeight,
  borderBottom: `1px solid ${colors.border}`,
};

export const tableCellStyle: CSSProperties = {
  textAlign: "center",
  padding: px(spacing.md),
  borderBottom: `1px solid ${colors.borderMuted}`,
};

