"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  Text,
  Metric,
  Flex,
  Icon,
  Title,
  Button,
  Badge,
} from "@tremor/react";
import {
  CalendarDaysIcon,
  RectangleStackIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { SeasonPlan } from "@/type";
import { TasksBoard } from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";

export default function SeasonsDashboardTab() {
  const [stats, setStats] = useState({
    activeSeasons: 0,
    activeSeries: 0,
    upcomingActivities: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      // Fetch seasons
      const seasonsRes = await fetch("/api/seasons");
      const seasonsData = await seasonsRes.json();
      const seasons = seasonsData.success ? seasonsData.seasons : [];

      const now = new Date();
      const activeSeasonsList = seasons.filter((s: SeasonPlan) => {
        const start = new Date(s.start_date);
        const end = new Date(s.end_date);
        return start <= now && end >= now;
      });

      // Fetch activities
      const activitiesRes = await fetch("/api/activities");
      const activitiesData = await activitiesRes.json();
      const activities = activitiesData.success ? activitiesData.activities : [];

      const thisMonth = activities.filter((a: any) => {
        const d = new Date(a.activity_date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      // Sort activities by ID descending (newest first)
      const sortedActivities = [...activities].sort((a, b) => b.id - a.id).slice(0, 5);

      setStats({
        activeSeasons: activeSeasonsList.length,
        activeSeries: new Set(activities.map((a: any) => a.series_id)).size,
        upcomingActivities: thisMonth,
      });
      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error("Error fetching dashboard stats", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Flex justifyContent="between" alignItems="center" className="flex-wrap gap-4">
          <div>
            <Title className="text-xl font-bold" style={{ color: cssVar.text.primary }}>
              מבט כללי · עונות ופעילויות
            </Title>
            <Text style={{ color: cssVar.text.muted }}>
              סיכום נתונים מרכזיים
            </Text>
          </div>
          <Button variant="secondary" onClick={fetchStats} disabled={loading}>
            רענן
          </Button>
        </Flex>
      </Card>

      {/* KPI Cards */}
      {loading ? (
        <div className="text-center py-10" style={{ color: cssVar.text.muted }}>
          טוען נתונים...
        </div>
      ) : (
        <Grid numItems={1} numItemsSm={3} className="gap-6">
          <Card decoration="top" decorationColor="blue">
            <Flex alignItems="start">
              <div>
                <Text
                  className="text-sm font-medium uppercase tracking-wide"
                  style={{ color: cssVar.text.muted }}
                >
                  עונות פעילות
                </Text>
                <Metric
                  className="text-3xl font-bold mt-1"
                  style={{ color: cssVar.text.primary }}
                >
                  {stats.activeSeasons}
                </Metric>
              </div>
              <Icon icon={CalendarDaysIcon} variant="light" size="lg" color="blue" />
            </Flex>
          </Card>

          <Card decoration="top" decorationColor="indigo">
            <Flex alignItems="start">
              <div>
                <Text
                  className="text-sm font-medium uppercase tracking-wide"
                  style={{ color: cssVar.text.muted }}
                >
                  סדרות פעילות (החודש)
                </Text>
                <Metric
                  className="text-3xl font-bold mt-1"
                  style={{ color: cssVar.text.primary }}
                >
                  {stats.activeSeries}
                </Metric>
              </div>
              <Icon icon={RectangleStackIcon} variant="light" size="lg" color="indigo" />
            </Flex>
          </Card>

          <Card decoration="top" decorationColor="emerald">
            <Flex alignItems="start">
              <div>
                <Text
                  className="text-sm font-medium uppercase tracking-wide"
                  style={{ color: cssVar.text.muted }}
                >
                  פעילויות החודש
                </Text>
                <Metric
                  className="text-3xl font-bold mt-1"
                  style={{ color: cssVar.text.primary }}
                >
                  {stats.upcomingActivities}
                </Metric>
              </div>
              <Icon icon={SparklesIcon} variant="light" size="lg" color="emerald" />
            </Flex>
          </Card>
        </Grid>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Left Column: Tasks Board */}
        <TasksBoard entityType="season_general" title="משימות ניהול עונות" />

        {/* Right Column: Recent Activities */}
        <Card>
          <Title className="mb-4">פעילויות שנוצרו לאחרונה</Title>
          <div className="flex flex-col gap-3">
            {recentActivities.length === 0 && (
              <Text style={{ color: cssVar.text.muted }}>
                לא נמצאו פעילויות חדשות.
              </Text>
            )}
            {recentActivities.map((item) => (
              <div
                key={item.id}
                className="p-3 border rounded-lg transition-colors hover:bg-tremor-background-subtle"
                style={{ borderColor: cssVar.border.muted }}
              >
                <Flex justifyContent="between" className="mb-1">
                  <Text className="font-bold" style={{ color: cssVar.text.primary }}>
                    {item.group_name || "ללא קבוצה"}
                  </Text>
                  <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                    {item.activity_date
                      ? new Date(item.activity_date).toLocaleDateString("he-IL")
                      : "—"}
                  </Text>
                </Flex>
                <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                  {item.kind} · {item.location || "—"}
                </Text>
                <Badge size="xs" color="slate" className="mt-2">
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
