import type { CSSProperties } from "react";
import { colors, radii, spacing, typography } from "../foundations";

const px = (value: number) => `${value}px`;

export const labelStyle: CSSProperties = {
  fontSize: px(typography.sizes.sm),
  fontWeight: typography.bodyWeight + 100,
  color: colors.textMuted,
  marginBottom: px(spacing.xs),
  display: "block",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: `${px(spacing.sm)} ${px(spacing.md)}`,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.input,
  fontSize: px(typography.sizes.base),
  background: colors.surface,
};

export const fieldRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: px(spacing.md),
};

export const sectionTitle: CSSProperties = {
  fontSize: px(typography.sizes.lg),
  fontWeight: typography.headingsWeight,
  color: colors.textPrimary,
  marginBottom: px(spacing.sm),
};

