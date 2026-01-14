"use client";

import type { CSSProperties, ReactNode } from "react";
import { Button } from "@/app/components/ui";
import { cssVar, numericValues, tw, presets } from "@/app/styles/design-system";

// --- Section Card Style ---

export const sectionCardStyle: CSSProperties = {
  padding: numericValues.spacing[6],
  background: cssVar.bg.secondary,
  borderRadius: numericValues.radius.lg,
  border: `1px solid ${cssVar.border.muted}`,
};

export const smallActionButtonStyle: CSSProperties = {
  fontSize: numericValues.fontSize.xs,
  padding: `${numericValues.spacing[1]}px ${numericValues.spacing[2]}px`,
};

// --- Status Pill ---

const pillBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `${numericValues.spacing[1]}px ${numericValues.spacing[2]}px`,
  borderRadius: numericValues.radius.md,
  fontSize: numericValues.fontSize.xs,
  fontWeight: numericValues.fontWeight.semibold,
};

const pillMap = {
  success: { bg: "var(--color-success-light)", fg: "var(--color-success-text)" },
  danger: { bg: "var(--color-danger-light)", fg: "var(--color-danger-text)" },
  warning: { bg: "var(--color-warning-light)", fg: "var(--color-warning-text)" },
  info: { bg: "var(--color-info-light)", fg: "var(--color-info-text)" },
  muted: { bg: "var(--color-bg-tertiary)", fg: "var(--color-text-muted)" },
  neutral: { bg: "var(--color-bg-tertiary)", fg: "var(--color-text-primary)" },
  active: { bg: "var(--color-success-light)", fg: "var(--color-success-text)" },
  inactive: { bg: "var(--color-danger-light)", fg: "var(--color-danger-text)" },
} as const;

export type StatusTone = keyof typeof pillMap;

export function StatusPill({
  tone,
  children,
  style,
}: {
  tone: StatusTone;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const palette = pillMap[tone] || pillMap.info;
  return (
    <span
      style={{
        ...pillBase,
        background: palette.bg,
        color: palette.fg,
        ...(style || {}),
      }}
    >
      {children}
    </span>
  );
}

// --- Section ---

export function Section({
  title,
  subtitle,
  actions,
  children,
  style,
  bodyStyle,
  background,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
  background?: string;
}) {
  return (
    <div
      style={{
        ...sectionCardStyle,
        background: background || sectionCardStyle.background,
        ...(style || {}),
      }}
    >
      {(title || subtitle || actions) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: numericValues.spacing[3],
            marginBottom: numericValues.spacing[4],
            flexWrap: "wrap",
          }}
        >
          <div>
            {title && (
              <h4 
                className="text-ds-text-primary font-semibold"
                style={{ margin: 0, fontSize: numericValues.fontSize.base, lineHeight: 1.4 }}
              >
                {title}
              </h4>
            )}
            {subtitle && (
              <p
                className="text-ds-text-muted"
                style={{
                  margin: "4px 0 0",
                  fontSize: numericValues.fontSize.sm,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions}
        </div>
      )}
      <div
        style={{
          ...(bodyStyle || {}),
          display: "flex",
          flexDirection: "column",
          gap: numericValues.spacing[3],
        }}
      >
        {children}
      </div>
    </div>
  );
}

// --- Form Grid ---

export function FormGrid({
  children,
  minWidth = 200,
  columns,
  gap = numericValues.spacing[4],
  style,
}: {
  children: ReactNode;
  minWidth?: number;
  columns?: string;
  gap?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          columns || `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
        gap,
        ...(style || {}),
      }}
    >
      {children}
    </div>
  );
}

// --- Small Action Button ---

export function SmallActionButton({
  children,
  style,
  ...rest
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      size="sm"
      {...rest}
      style={{
        ...smallActionButtonStyle,
        ...(style || {}),
      }}
    >
      {children}
    </Button>
  );
}
