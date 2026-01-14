"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  Title,
  Text,
  Metric,
  Flex,
  Badge,
  Icon,
} from "@tremor/react";
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { tw } from "@/app/styles/design-system";

type DashboardStats = {
  volunteers: { total: number; active: number };
  surfers: { total: number; active: number; byGroup: Record<string, number> };
  activities: {
    total: number;
    upcoming: number;
    byKind: Record<string, number>;
  };
  equipment: { total: number; needsRepair: number };
  donors: { total: number; active: number };
  suppliers: { total: number; active: number };
};

const ACTIVITY_KIND_LABELS: Record<string, string> = {
  surf: "גלישה",
  social: "חברתי",
  special: "אירוע מיוחד",
  training: "הכשרה והדרכה",
  lecture: "הכשרה והדרכה", // Legacy
  preparation: "הכנה", // Legacy
  other: "אחר",
};

export default function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      href: "/volunteers",
      label: "הוסף מתנדב",
      icon: UserGroupIcon,
      color: "blue",
    },
    {
      href: "/surfers",
      label: "הוסף גולש",
      icon: UserIcon,
      color: "cyan",
    },
    {
      href: "/activities",
      label: "תזמן פעילות",
      icon: CalendarIcon,
      color: "blue",
    },
    {
      href: "/equipment",
      label: "נהל ציוד",
      icon: WrenchScrewdriverIcon,
      color: "emerald",
    },
  ];

  if (loading) {
    return (
      <div className="p-10 flex justify-center text-ds-text-muted">
        טוען נתונים...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-10 flex justify-center text-ds-danger">
        שגיאה בטעינת נתונים
      </div>
    );
  }

  return (
    <main className="p-6 sm:p-10 bg-ds-bg-secondary min-h-screen" dir="rtl">
      <div className="mb-8">
        <Title className="text-2xl font-bold text-ds-text-primary">ברוך הבא למערכת PosSEAble</Title>
        <Text className="text-ds-text-muted">סקירה כללית של המערכת</Text>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        {/* Volunteers */}
        <Card decoration="top" decorationColor="blue">
          <Flex alignItems="start">
            <div>
              <Text className="text-sm font-medium text-ds-text-muted uppercase tracking-wide">מתנדבים</Text>
              <Metric className="text-3xl font-bold text-ds-text-primary mt-1">{stats.volunteers.total}</Metric>
            </div>
            <Icon icon={UserGroupIcon} variant="light" size="lg" color="blue" />
          </Flex>
          <Flex className="mt-6">
            <Text className="text-sm text-ds-text-secondary">פעילים</Text>
            <Text className="font-bold text-ds-success">
              {stats.volunteers.active}
            </Text>
          </Flex>
          <Flex className="mt-1">
            <Text className="text-sm text-ds-text-secondary">לא פעילים</Text>
            <Text className="text-ds-text-primary">{stats.volunteers.total - stats.volunteers.active}</Text>
          </Flex>
        </Card>

        {/* Surfers */}
        <Card decoration="top" decorationColor="cyan">
          <Flex alignItems="start">
            <div>
              <Text className="text-sm font-medium text-ds-text-muted uppercase tracking-wide">גולשים</Text>
              <Metric className="text-3xl font-bold text-ds-text-primary mt-1">{stats.surfers.total}</Metric>
            </div>
            <Icon icon={UserIcon} variant="light" size="lg" color="cyan" />
          </Flex>
          <Flex className="mt-6">
            <Text className="text-sm text-ds-text-secondary">פעילים</Text>
            <Text className="font-bold text-ds-success">
              {stats.surfers.active}
            </Text>
          </Flex>
          <Flex className="mt-1">
            <Text className="text-sm text-ds-text-secondary">לא פעילים</Text>
            <Text className="text-ds-text-primary">{stats.surfers.total - stats.surfers.active}</Text>
          </Flex>
        </Card>

        {/* Activities */}
        <Card decoration="top" decorationColor="indigo">
          <Flex alignItems="start">
            <div>
              <Text className="text-sm font-medium text-ds-text-muted uppercase tracking-wide">פעילויות</Text>
              <Metric className="text-3xl font-bold text-ds-text-primary mt-1">{stats.activities.total}</Metric>
            </div>
            <Icon icon={CalendarIcon} variant="light" size="lg" color="indigo" />
          </Flex>
          <Flex className="mt-6">
            <Text className="text-sm text-ds-text-secondary">פעילויות קרובות</Text>
            <Badge color="amber">{stats.activities.upcoming}</Badge>
          </Flex>
        </Card>

        {/* Equipment */}
        <Card decoration="top" decorationColor="emerald">
          <Flex alignItems="start">
            <div>
              <Text className="text-sm font-medium text-ds-text-muted uppercase tracking-wide">ציוד</Text>
              <Metric className="text-3xl font-bold text-ds-text-primary mt-1">{stats.equipment.total}</Metric>
            </div>
            <Icon
              icon={WrenchScrewdriverIcon}
              variant="light"
              size="lg"
              color="emerald"
            />
          </Flex>
          <Flex className="mt-6">
            <Text className="text-sm text-ds-text-secondary">תקין</Text>
            <Text className="font-bold text-ds-success">
              {stats.equipment.total - stats.equipment.needsRepair}
            </Text>
          </Flex>
          <Flex className="mt-1">
            <Text className="text-sm text-ds-text-secondary">דורש תיקון</Text>
            <Text className="font-bold text-ds-danger">
              {stats.equipment.needsRepair}
            </Text>
          </Flex>
        </Card>

        {/* Donors */}
        <Card decoration="top" decorationColor="rose">
          <Flex alignItems="start">
            <div>
              <Text className="text-sm font-medium text-ds-text-muted uppercase tracking-wide">תורמים</Text>
              <Metric className="text-3xl font-bold text-ds-text-primary mt-1">{stats.donors.total}</Metric>
            </div>
            <Icon icon={HeartIcon} variant="light" size="lg" color="rose" />
          </Flex>
          <Flex className="mt-6">
            <Text className="text-sm text-ds-text-secondary">פעילים</Text>
            <Text className="font-bold text-ds-success">
              {stats.donors.active}
            </Text>
          </Flex>
        </Card>

        {/* Suppliers */}
        <Card decoration="top" decorationColor="slate">
          <Flex alignItems="start">
            <div>
              <Text className="text-sm font-medium text-ds-text-muted uppercase tracking-wide">ספקים</Text>
              <Metric className="text-3xl font-bold text-ds-text-primary mt-1">{stats.suppliers.total}</Metric>
            </div>
            <Icon icon={TruckIcon} variant="light" size="lg" color="slate" />
          </Flex>
          <Flex className="mt-6">
            <Text className="text-sm text-ds-text-secondary">פעילים</Text>
            <Text className="font-bold text-ds-success">
              {stats.suppliers.active}
            </Text>
          </Flex>
        </Card>
      </Grid>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Title className="text-ds-text-primary">גולשים לפי קבוצה</Title>
          <div className="mt-4 space-y-2">
            {Object.entries(stats.surfers.byGroup).map(([group, count]) => (
              <Flex key={group} className="p-2 hover:bg-ds-bg-hover rounded-lg transition-colors">
                <Text className="font-medium text-ds-text-primary">{group}</Text>
                <Text className="font-bold text-ds-text-primary">{count}</Text>
              </Flex>
            ))}
            {Object.keys(stats.surfers.byGroup).length === 0 && (
              <Text className="text-center italic mt-4 text-ds-text-muted">אין נתונים זמינים</Text>
            )}
          </div>
        </Card>

        <Card>
          <Title className="text-ds-text-primary">פעילויות לפי סוג</Title>
          <div className="mt-4 space-y-2">
            {Object.entries(stats.activities.byKind).map(([kind, count]) => (
              <Flex key={kind} className="p-2 hover:bg-ds-bg-hover rounded-lg transition-colors">
                <Text className="font-medium text-ds-text-primary">
                  {ACTIVITY_KIND_LABELS[kind] || kind}
                </Text>
                <Text className="font-bold text-ds-text-primary">{count}</Text>
              </Flex>
            ))}
            {Object.keys(stats.activities.byKind).length === 0 && (
              <Text className="text-center italic mt-4 text-ds-text-muted">אין נתונים זמינים</Text>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <Title className="text-ds-text-primary">פעולות מהירות</Title>
          <Text className="text-ds-text-muted">גישה מהירה למסכים המרכזיים של המערכת</Text>
          <Grid numItems={1} numItemsSm={2} numItemsMd={4} className="gap-4 mt-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="block">
                <Card
                  className="hover:bg-ds-bg-hover transition-colors cursor-pointer h-full flex flex-col items-center justify-center py-6 gap-3 border border-ds-border ring-0 shadow-none hover:shadow-ds-sm"
                  decoration="left"
                  decorationColor={action.color}
                >
                  <Icon
                    icon={action.icon}
                    size="xl"
                    color={action.color}
                    variant="simple"
                  />
                  <Text className="font-medium text-ds-text-primary">{action.label}</Text>
                </Card>
              </Link>
            ))}
          </Grid>
        </Card>
      </div>
    </main>
  );
}
