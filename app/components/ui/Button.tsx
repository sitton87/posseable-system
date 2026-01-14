"use client";

import { cssVar, numericValues } from "@/app/styles/design-system";
import type { ButtonHTMLAttributes, CSSProperties } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
};

const buttonBase: CSSProperties = {
  padding: `${cssVar.spacing[2]} ${cssVar.spacing[4]}`,
  borderRadius: cssVar.button.radius,
  border: "none",
  fontWeight: numericValues.fontWeight.semibold,
  cursor: "pointer",
  fontSize: numericValues.fontSize.base,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: cssVar.spacing[2],
  transition: `all var(--duration-fast) var(--ease-in-out)`,
};

const sizeStyles: Record<"sm" | "md" | "lg", CSSProperties> = {
  sm: {
    padding: `${cssVar.spacing[1]} ${cssVar.spacing[3]}`,
    fontSize: numericValues.fontSize.sm,
    height: cssVar.button.heightSm,
  },
  md: {
    padding: `${cssVar.spacing[2]} ${cssVar.spacing[4]}`,
    fontSize: numericValues.fontSize.base,
    height: cssVar.button.height,
  },
  lg: {
    padding: `${cssVar.spacing[3]} ${cssVar.spacing[6]}`,
    fontSize: numericValues.fontSize.lg,
    height: cssVar.button.heightLg,
  },
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: cssVar.brand.primary,
    color: cssVar.text.inverted,
    boxShadow: cssVar.shadow.sm,
  },
  secondary: {
    background: cssVar.bg.secondary,
    color: cssVar.text.primary,
    border: `1px solid ${cssVar.border.primary}`,
  },
  ghost: {
    background: "transparent",
    color: cssVar.text.muted,
  },
  danger: {
    background: cssVar.danger.DEFAULT,
    color: cssVar.text.inverted,
    boxShadow: cssVar.shadow.sm,
  },
};

export function Button({
  variant = "primary",
  size = "md",
  style,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const combinedStyle: CSSProperties = {
    ...buttonBase,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(disabled && { opacity: 0.6, cursor: "not-allowed" }),
    ...style,
  };

  return (
    <button style={combinedStyle} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
