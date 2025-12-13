"use client";

import { useMemo } from "react";
import { Button, Card } from "@/app/components/ui";
import {
  StatCardGrid,
  TasksBoard,
  TaskEntityOption,
} from "@/app/components/shared";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { HomeTabProps } from "../types";
import { formatCurrency, formatDate, muted } from "../utils";

export default function DonorsHomeTab({
  stats,
  donors,
  onRefresh,
  loading,
}: HomeTabProps) {
  const statCards = [
    { label: 'סה"כ תורמים', value: stats.total_donors },
    {
      label: 'סה"כ תרומות',
      value: formatCurrency(stats.total_donations),
    },
    {
      label: "התרומה הגבוהה ביותר",
      value: formatCurrency(stats.highest_donation),
    },
    {
      label: "ממוצע תרומה",
      value: formatCurrency(stats.average_donation),
    },
  ];

  const donorEntities: TaskEntityOption[] = donors.map((d) => ({
    id: d.national_id,
    name: d.full_name,
    subtitle: d.organization || undefined,
  }));

  // נגזור את הפעילות האחרונה (תורמים שתרמו לאחרונה)
  const recentActivity = useMemo(() => {
    return [...donors]
      .filter((d) => d.last_donation_date)
      .sort((a, b) => {
        const dateA = new Date(a.last_donation_date!).getTime();
        const dateB = new Date(b.last_donation_date!).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [donors]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>דף הבית · תורמים</h3>
            <p style={{ margin: "4px 0 0", color: muted, fontSize: 13 }}>
              מבט על בריאות מערך התורמים ומעקב משימות.
            </p>
          </div>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענן נתונים
          </Button>
        </div>
        <StatCardGrid stats={statCards} />
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: spacing.lg,
        }}
      >
        <TasksBoard
          entityType="donor"
          entities={donorEntities}
          title="משימות ופתקים (תורמים)"
        />

        <Card style={{ padding: spacing.lg }}>
          <h4 style={{ margin: "0 0 16px 0" }}>תרומות אחרונות</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            {recentActivity.length === 0 ? (
              <div
                style={{
                  color: muted,
                  textAlign: "center",
                  padding: spacing.md,
                }}
              >
                אין פעילות תרומות רשומה.
              </div>
            ) : (
              recentActivity.map((donor) => (
                <div
                  key={donor.national_id}
                  style={{
                    padding: spacing.sm,
                    border: `1px solid ${colors.borderMuted}`,
                    borderRadius: radii.card,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {donor.full_name}
                    </div>
                    <div style={{ fontSize: 12, color: muted }}>
                      {donor.organization || "פרטי"}
                    </div>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {formatDate(donor.last_donation_date)}
                    </div>
                    <div style={{ fontSize: 11, color: muted }}>
                      תאריך תרומה
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

