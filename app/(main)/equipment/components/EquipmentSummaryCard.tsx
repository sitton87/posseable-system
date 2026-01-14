"use client";

import { Card, Title, Text, Button } from "@tremor/react";
import { StatCardGrid } from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";
import type { StatSummary } from "../types";

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
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <Title>🛠️ קטלוג ציוד</Title>
          <Text style={{ color: cssVar.text.muted }}>
            ניהול מרוכז של משפחות, קטגוריות, מלאי ומחסנים
          </Text>
        </div>
        <div className="flex gap-2">
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
          className="mt-4 p-4 rounded-lg"
          style={{
            backgroundColor: cssVar.status.dangerLight,
            color: cssVar.status.danger,
          }}
        >
          {error}
        </div>
      )}
      <div className="mt-5">
        <StatCardGrid stats={statCards} />
      </div>
    </Card>
  );
}
