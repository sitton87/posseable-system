"use client";

import type { ReactNode } from "react";
import { Card } from "@/app/components/ui";
import { cssVar, numericValues, card as cardPresets } from "@/app/styles/design-system";

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
        gap: numericValues.spacing[4],
      }}
    >
      {stats.map((stat) => (
        <Card
          key={stat.label}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: numericValues.spacing[2],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: numericValues.spacing[2],
              width: "100%",
            }}
          >
            {stat.icon && (
              <span className="text-ds-text-muted">{stat.icon}</span>
            )}
            <div className="text-xs text-ds-text-muted">{stat.label}</div>
          </div>
          <div
            style={{
              fontSize: numericValues.fontSize["3xl"],
              fontWeight: numericValues.fontWeight.bold,
              margin: `${numericValues.spacing[2]}px 0`,
              lineHeight: 1.1,
              width: "100%",
            }}
            className="text-ds-text-primary"
          >
            {stat.value}
          </div>
          {stat.hint && (
            <div className="text-xs text-ds-text-muted w-full">
              {stat.hint}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
