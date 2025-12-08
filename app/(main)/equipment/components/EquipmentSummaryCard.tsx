"use client";

import { Card, Button } from "@/app/components/ui";
import { StatCardGrid } from "@/app/components/shared";
import { colors, spacing } from "@/app/styles/foundations";
import type { StatSummary } from "../types";
import { px } from "../utils";

type EquipmentSummaryCardProps = {
  statSummary: StatSummary;
  error: string | null;
  onRefresh: () => void;
  onCreate: () => void;
  canCreate?: boolean;
};

export function EquipmentSummaryCard({
  statSummary,
  error,
  onRefresh,
  onCreate,
  canCreate = true,
}: EquipmentSummaryCardProps) {
  const statCards = [
    {
      label: "סה״כ פריטים",
      value: statSummary.totalItems,
    },
    {
      label: "סה״כ יחידות פיזיות",
      value: statSummary.totalUnits,
    },
    {
      label: "פריטים מתכלים",
      value: statSummary.consumables,
    },
    {
      label: "פריטים מושכרים",
      value: statSummary.rentals,
    },
  ];

  return (
    <Card>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: spacing.md,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
            🛠️ קטלוג ציוד
          </h2>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: 14 }}>
            ניהול מרוכז של משפחות, קטגוריות, מלאי ומחסנים
          </p>
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button variant="secondary" onClick={onRefresh}>
            רענן נתונים
          </Button>
          <Button onClick={onCreate} disabled={!canCreate}>
            + פריט חדש
          </Button>
        </div>
      </div>
      {error && (
        <div
          style={{
            marginTop: spacing.md,
            padding: px(spacing.md),
            borderRadius: spacing.sm,
            background: colors.dangerSoft,
            color: colors.danger,
          }}
        >
          {error}
        </div>
      )}
      <div style={{ marginTop: spacing.lg }}>
        <StatCardGrid stats={statCards} />
      </div>
    </Card>
  );
}
