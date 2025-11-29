import type { CSSProperties } from "react";
import { colors, radii, shadows, spacing } from "../foundations";

const px = (value: number) => `${value}px`;

export const modalOverlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: colors.overlay,
  display: "grid",
  placeItems: "center",
  zIndex: 1000,
  padding: px(spacing.lg),
};

export const modalCard: CSSProperties = {
  background: colors.surface,
  borderRadius: radii.card,
  boxShadow: shadows.dropdown,
  width: "min(640px, 95vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: px(spacing.xl),
};

