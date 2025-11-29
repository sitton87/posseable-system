import type { CSSProperties } from "react";
import { colors, radii, shadows, spacing, typography } from "../foundations";

const px = (value: number) => `${value}px`;

const buttonBase: CSSProperties = {
  padding: `${px(spacing.sm)} ${px(spacing.md)}`,
  borderRadius: radii.button,
  border: "none",
  fontWeight: typography.headingsWeight,
  cursor: "pointer",
  fontSize: px(typography.sizes.base),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: px(spacing.xs),
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
};

export const buttonVariants = {
  primary: {
    ...buttonBase,
    background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
    color: colors.surface,
    boxShadow: shadows.card,
  } as CSSProperties,
  secondary: {
    ...buttonBase,
    background: colors.surfaceAlt,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
  } as CSSProperties,
  ghost: {
    ...buttonBase,
    background: "transparent",
    color: colors.textMuted,
  } as CSSProperties,
};
