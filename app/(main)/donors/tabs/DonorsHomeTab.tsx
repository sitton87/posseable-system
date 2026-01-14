"use client";

import { useMemo } from "react";
import {
  Card,
  Grid,
  Text,
  Metric,
  Flex,
  Icon,
  Title,
  Button,
} from "@tremor/react";
import {
  HeartIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  TasksBoard,
  TaskEntityOption,
} from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";
import { HomeTabProps } from "../types";
import { formatCurrency, formatDate } from "../utils";

export default function DonorsHomeTab({
  stats,
  donors,
  onRefresh,
  loading,
}: HomeTabProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Flex justifyContent="between" alignItems="center" className="flex-wrap gap-4">
          <div>
            <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
              דף הבית · תורמים
            </Title>
            <Text style={{ color: cssVar.text.muted }}>
              מבט על בריאות מערך התורמים ומעקב משימות.
            </Text>
          </div>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענן נתונים
          </Button>
        </Flex>
      </Card>

      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="rose">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                סה״כ תורמים
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {stats.total_donors}
              </Metric>
            </div>
            <Icon icon={HeartIcon} variant="light" size="lg" color="rose" />
          </Flex>
          <Flex className="mt-4">
            <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
              פעילים
            </Text>
            <Text className="font-bold" style={{ color: cssVar.status.success }}>
              {donors.filter(d => d.is_active).length}
            </Text>
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                סה״כ תרומות
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {formatCurrency(stats.total_donations)}
              </Metric>
            </div>
            <Icon icon={CurrencyDollarIcon} variant="light" size="lg" color="emerald" />
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                התרומה הגבוהה ביותר
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {formatCurrency(stats.highest_donation)}
              </Metric>
            </div>
            <Icon icon={ArrowTrendingUpIcon} variant="light" size="lg" color="blue" />
          </Flex>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                ממוצע תרומה
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {formatCurrency(stats.average_donation)}
              </Metric>
            </div>
            <Icon icon={ChartBarIcon} variant="light" size="lg" color="amber" />
          </Flex>
        </Card>
      </Grid>

      {/* Tasks and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        <TasksBoard
          entityType="donor"
          entities={donorEntities}
          title="משימות ופתקים (תורמים)"
        />

        <Card>
          <Title className="mb-4">תרומות אחרונות</Title>
          <div className="flex flex-col gap-3">
            {recentActivity.length === 0 ? (
              <div
                className="text-center py-6"
                style={{ color: cssVar.text.muted }}
              >
                אין פעילות תרומות רשומה.
              </div>
            ) : (
              recentActivity.map((donor) => (
                <div
                  key={donor.national_id}
                  className="p-3 border rounded-lg flex justify-between items-center transition-colors hover:bg-tremor-background-subtle"
                  style={{ borderColor: cssVar.border.muted }}
                >
                  <div>
                    <div className="font-semibold text-sm" style={{ color: cssVar.text.primary }}>
                      {donor.full_name}
                    </div>
                    <div className="text-xs" style={{ color: cssVar.text.muted }}>
                      {donor.organization || "פרטי"}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium" style={{ color: cssVar.text.primary }}>
                      {formatDate(donor.last_donation_date)}
                    </div>
                    <div className="text-xs" style={{ color: cssVar.text.muted }}>
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
