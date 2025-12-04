"use client";

import { Card, Button } from "@/app/components/ui";
import { statCardStyle } from "@/app/styles/components";
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: spacing.md,
          marginTop: spacing.lg,
        }}
      >
        <div style={statCardStyle}>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            סה״כ פריטים
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {statSummary.totalItems}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            סה״כ יחידות פיזיות
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {statSummary.totalUnits}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            פריטים מתכלים
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {statSummary.consumables}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            פריטים מושכרים
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {statSummary.rentals}
          </div>
        </div>
      </div>
    </Card>
  );
}
