"use client";

import type { ReactNode } from "react";
import { Card } from "@/app/components/ui";
import { colors, radii, shadows, spacing } from "@/app/styles/foundations";

const px = (value: number) => `${value}px`;

export type StatCard = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
};

type StatCardGridProps = {
  stats: StatCard[];
  columns?: string;
};

export function StatCardGrid({
  stats,
  columns = "repeat(auto-fit, minmax(200px, 1fr))",
}: StatCardGridProps) {
  if (!stats.length) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: columns,
        gap: spacing.md,
      }}
    >
      {stats.map((stat) => (
        <Card
          key={stat.label}
          style={{
            padding: px(spacing.md),
            borderRadius: radii.card,
            boxShadow: shadows.card,
            display: "flex",
            flexDirection: "column",
            gap: spacing.xs,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            {stat.icon}
            <div style={{ fontSize: 12, color: colors.textMuted }}>{stat.label}</div>
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              margin: `${spacing.xs}px 0`,
              lineHeight: 1.1,
            }}
          >
            {stat.value}
          </div>
          {stat.hint && (
            <div style={{ fontSize: 12, color: colors.textMuted }}>{stat.hint}</div>
          )}
        </Card>
      ))}
    </div>
  );
}

