import type { CSSProperties, ReactNode } from "react";
import { Button } from "@/app/components/ui";
import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from "@/app/styles/foundations";

const px = (value: number) => `${value}px`;

export const sectionCardStyle: CSSProperties = {
  padding: px(spacing.lg),
  background: colors.surfaceAlt,
  borderRadius: radii.card,
  border: `1px solid ${colors.borderMuted}`,
};

export const smallActionButtonStyle: CSSProperties = {
  fontSize: 12,
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
};

const pillBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
  borderRadius: radii.button,
  fontSize: 12,
  fontWeight: typography.headingsWeight,
};

const pillMap = {
  success: { bg: colors.successSoft, fg: colors.success },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  warning: { bg: "rgba(217,119,6,0.15)", fg: colors.warning },
  info: { bg: colors.primarySoft, fg: colors.primary },
  muted: { bg: colors.surfaceAlt, fg: colors.textMuted },
  neutral: { bg: colors.surfaceAlt, fg: colors.textPrimary },
  active: { bg: colors.successSoft, fg: colors.success },
  inactive: { bg: colors.dangerSoft, fg: colors.danger },
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
            gap: spacing.sm,
            marginBottom: spacing.md,
            flexWrap: "wrap",
          }}
        >
          <div>
            {title && (
              <h4 style={{ margin: 0, fontSize: 16, lineHeight: 1.4 }}>
                {title}
              </h4>
            )}
            {subtitle && (
              <p
                style={{
                  margin: "4px 0 0",
                  color: colors.textMuted,
                  fontSize: 13,
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
          gap: spacing.sm,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function FormGrid({
  children,
  minWidth = 200,
  columns,
  gap = spacing.md,
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

export function SmallActionButton({
  children,
  style,
  ...rest
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
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
