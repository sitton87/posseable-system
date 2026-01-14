"use client";

import { useEffect, useState } from "react";
import { Activity, Volunteer } from "@/type";
import {
  Card,
  Title,
  Text,
  Button,
} from "@tremor/react";
import {
  StatCardGrid,
  TasksBoard,
  TaskEntityOption,
  TaskAssigneeOption,
} from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function ActivitiesHomeTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    planned: 0,
    completed: 0,
    cancelled: 0,
    thisWeek: 0,
    future: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  useEffect(() => {
    fetchStats();
    fetchVolunteers();
  }, []);

  async function fetchVolunteers() {
    try {
      const res = await fetch("/api/volunteers?limit=1000");
      const data = await res.json();
      if (data.success) {
        setVolunteers(data.volunteers);
      }
    } catch (err) {
      console.error("Failed to load volunteers for assignment", err);
    }
  }

  async function fetchStats() {
    try {
      setLoading(true);
      const statsRes = await fetch("/api/activities/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      const res = await fetch("/api/activities?sort=date_desc&limit=5");
      const data = await res.json();
      if (data.success) {
        setRecentActivities(data.activities.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "פעילויות מתוכננות", value: stats.future },
    { label: "השבוע", value: stats.thisWeek },
    { label: "הושלמו", value: stats.completed },
    { label: "בוטלו", value: stats.cancelled },
  ];

  const assignees: TaskAssigneeOption[] = volunteers.map((v) => ({
    id: v.national_id,
    name: v.full_name,
  }));

  const activityEntities: TaskEntityOption[] = recentActivities.map((a) => ({
    id: a.id.toString(),
    name: a.group_name || "פעילות ללא שם",
    subtitle: a.activity_date
      ? new Date(a.activity_date).toLocaleDateString("he-IL")
      : "",
  }));

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex justify-between items-center gap-2 mb-2 flex-wrap">
          <div>
            <Title>מבט כללי · פעילויות</Title>
            <Text style={{ color: cssVar.text.muted }}>
              סטטוסים ומדדים מרכזיים של הפעילויות
            </Text>
          </div>
          <Button variant="secondary" size="sm" icon={ArrowPathIcon} onClick={fetchStats}>
            רענן
          </Button>
        </div>
        {loading ? (
          <div className="p-5 text-center">
            <Text style={{ color: cssVar.text.muted }}>טוען נתונים...</Text>
          </div>
        ) : (
          <StatCardGrid stats={statCards} />
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
        <TasksBoard
          entityType="activity"
          entities={activityEntities}
          assignees={assignees}
          title="משימות ופתקים (כללי)"
          fixedEntityId="general"
        />

        <Card className="p-5">
          <Title className="mb-3">פעילויות קרובות</Title>
          <div className="flex flex-col gap-2">
            {recentActivities.length === 0 && (
              <Text style={{ color: cssVar.text.muted }}>
                לא נמצאו פעילויות קרובות.
              </Text>
            )}
            {recentActivities.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-2"
                style={{ borderColor: cssVar.border.primary }}
              >
                <div className="flex justify-between">
                  <Text className="font-bold">
                    {item.group_name || "ללא קבוצה"}
                  </Text>
                  <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                    {item.activity_date
                      ? new Date(item.activity_date).toLocaleDateString("he-IL")
                      : "—"}
                  </Text>
                </div>
                <Text style={{ color: cssVar.text.muted }}>
                  {item.kind} · {item.location || "—"}
                </Text>
                <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                  מנהל: {item.activity_manager_name || item.lead_name || "—"}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
