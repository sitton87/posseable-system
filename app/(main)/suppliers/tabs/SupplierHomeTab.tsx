"use client";

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
  TruckIcon,
  CheckBadgeIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { TasksBoard, TaskEntityOption } from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";
import { Supplier } from "@/type";
import { SupplierSummaryData } from "../types";

type Props = {
  suppliers: Supplier[];
  summary: SupplierSummaryData | null;
  loading: boolean;
  onRefresh: () => void;
};

export default function SupplierHomeTab({
  suppliers,
  summary,
  loading,
  onRefresh,
}: Props) {
  const stats = summary?.stats || {
    totalSuppliers: 0,
    activeSuppliers: 0,
    serviceSuppliers: 0,
    activeContracts: 0,
  };

  const supplierEntities: TaskEntityOption[] = suppliers.map((s) => ({
    id: s.supplier_identifier,
    name: s.name,
    subtitle: s.contact_name || undefined,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Flex justifyContent="between" alignItems="center" className="flex-wrap gap-4">
          <div>
            <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
              סקירת ספקים
            </Title>
            <Text style={{ color: cssVar.text.muted }}>
              תמונת מצב של המערך והפעילות האחרונה.
            </Text>
          </div>
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            רענן נתונים
          </Button>
        </Flex>
      </Card>

      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card decoration="top" decorationColor="slate">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                סה״כ ספקים
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {stats.totalSuppliers}
              </Metric>
            </div>
            <Icon icon={TruckIcon} variant="light" size="lg" color="slate" />
          </Flex>
          <Text className="text-xs mt-2" style={{ color: cssVar.text.muted }}>
            כל הספקים במערכת
          </Text>
        </Card>

        <Card decoration="top" decorationColor="emerald">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                ספקים פעילים
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {stats.activeSuppliers}
              </Metric>
            </div>
            <Icon icon={CheckBadgeIcon} variant="light" size="lg" color="emerald" />
          </Flex>
          <Text className="text-xs mt-2" style={{ color: cssVar.text.muted }}>
            זמינים לשיוך עבודות
          </Text>
        </Card>

        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                בעלי מקצוע
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {stats.serviceSuppliers}
              </Metric>
            </div>
            <Icon icon={WrenchScrewdriverIcon} variant="light" size="lg" color="blue" />
          </Flex>
          <Text className="text-xs mt-2" style={{ color: cssVar.text.muted }}>
            ספקים המסווגים לשירות
          </Text>
        </Card>

        <Card decoration="top" decorationColor="amber">
          <Flex alignItems="start">
            <div>
              <Text
                className="text-sm font-medium uppercase tracking-wide"
                style={{ color: cssVar.text.muted }}
              >
                חוזים פעילים
              </Text>
              <Metric
                className="text-3xl font-bold mt-1"
                style={{ color: cssVar.text.primary }}
              >
                {stats.activeContracts}
              </Metric>
            </div>
            <Icon icon={DocumentTextIcon} variant="light" size="lg" color="amber" />
          </Flex>
          <Text className="text-xs mt-2" style={{ color: cssVar.text.muted }}>
            חוזים בתוקף
          </Text>
        </Card>
      </Grid>

      {/* Tasks and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        <TasksBoard
          entityType="supplier"
          entities={supplierEntities}
          title="משימות"
        />

        <Card>
          <Flex justifyContent="between" alignItems="center" className="mb-4">
            <Title>פעילות אחרונה</Title>
            {loading && (
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                טוען...
              </Text>
            )}
          </Flex>
          <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto">
            {(summary?.recentActivity || []).map((activity) => {
              const supplierName =
                suppliers.find(
                  (s) => s.supplier_identifier === activity.supplier_identifier
                )?.name || activity.supplier_identifier;
              return (
                <div
                  key={activity.activity_id}
                  className="p-3 border rounded-lg transition-colors hover:bg-tremor-background-subtle"
                  style={{ borderColor: cssVar.border.muted }}
                >
                  <Flex justifyContent="between" className="gap-2">
                    <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                      {supplierName}
                    </Text>
                    <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                      {new Date(activity.occurred_at).toLocaleString("he-IL")}
                    </Text>
                  </Flex>
                  <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                    סוג פעילות: {activity.activity_type}
                  </Text>
                  {activity.description && (
                    <Text className="text-sm" style={{ color: cssVar.text.secondary }}>
                      {activity.description}
                    </Text>
                  )}
                  {(activity.amount || activity.quantity) && (
                    <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                      {activity.quantity && `כמות: ${activity.quantity} `}
                      {activity.amount && `· עלות: ₪${activity.amount}`}
                    </Text>
                  )}
                  {activity.related_document_id && (
                    <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                      מסמך: {activity.related_document_id}
                    </Text>
                  )}
                </div>
              );
            })}
            {!summary?.recentActivity?.length && (
              <div
                className="text-center py-6 border border-dashed rounded-lg"
                style={{
                  color: cssVar.text.muted,
                  borderColor: cssVar.border.muted,
                }}
              >
                אין פעילות רשומה עדיין.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
