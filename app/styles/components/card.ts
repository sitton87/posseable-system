import type { CSSProperties } from "react";
import { colors, radii, shadows, spacing } from "../foundations";

const px = (value: number) => `${value}px`;

export const cardStyle: CSSProperties = {
  background: colors.surface,
  borderRadius: radii.card,
  padding: px(spacing.lg),
  border: `1px solid ${colors.borderMuted}`,
  boxShadow: shadows.card,
};

export const cardSection: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: px(spacing.sm),
};

export const sectionHeader: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: px(spacing.sm),
};

