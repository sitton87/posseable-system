"use client";

import { colors, spacing, radii } from "@/app/styles/foundations";
import { useEffect, useState } from "react";
import { Activity } from "@/type";
import { Card } from "@/app/components/ui";
import {
  SmallActionButton,
  StatCardGrid,
  TasksBoard,
  TaskEntityOption,
} from "@/app/components/shared";

const muted = colors.textMuted;

export default function ActivitiesHomeTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    planned: 0,
    completed: 0,
    cancelled: 0,
    thisWeek: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await fetch("/api/activities?status=Planned"); // Simplified fetch
      const data = await res.json();
      if (data.success) {
        // Mock stats calculation from list (in real app, use summary endpoint)
        const all: Activity[] = data.activities;
        setStats({
          planned: all.filter(a => a.status === "Planned").length,
          completed: all.filter(a => a.status === "Completed").length,
          cancelled: all.filter(a => a.status === "Cancelled").length,
          thisWeek: 0, // Logic omitted for brevity
        });
        setRecentActivities(all.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "פעילויות מתוכננות", value: stats.planned },
    { label: "השבוע", value: stats.thisWeek },
    { label: "הושלמו", value: stats.completed },
    { label: "בוטלו", value: stats.cancelled },
  ];

  // Map activities to "task entities" if we want to attach tasks to activities
  const activityEntities: TaskEntityOption[] = recentActivities.map(a => ({
    id: a.id.toString(),
    name: a.group_name || "פעילות ללא שם",
    subtitle: a.activity_date ? new Date(a.activity_date).toLocaleDateString("he-IL") : "",
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: spacing.sm,
            marginBottom: spacing.sm,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>מבט כללי · פעילויות</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              סטטוסים ומדדים מרכזיים של הפעילויות
            </p>
          </div>
          <SmallActionButton variant="secondary" onClick={fetchStats}>
            רענן
          </SmallActionButton>
        </div>
        {loading ? (
          <div style={{ padding: spacing.lg, textAlign: "center" }}>
            טוען נתונים...
          </div>
        ) : (
          <StatCardGrid stats={statCards} />
        )}
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: spacing.lg,
        }}
      >
        <TasksBoard
          entityType="activity"
          entities={activityEntities}
          title="משימות ופתקים"
        />

        <Card style={{ padding: spacing.lg }}>
          <h4 style={{ margin: "0 0 12px 0" }}>פעילויות קרובות</h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.sm,
            }}
          >
            {recentActivities.length === 0 && (
              <div style={{ color: muted, fontSize: 13 }}>
                לא נמצאו פעילויות קרובות.
              </div>
            )}
            {recentActivities.map((item) => (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${colors.borderMuted}`,
                  borderRadius: radii.card,
                  padding: spacing.sm,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div style={{ fontWeight: 700 }}>{item.group_name || "ללא קבוצה"}</div>
                  <div style={{ color: muted, fontSize: 12 }}>
                    {item.activity_date
                      ? new Date(item.activity_date).toLocaleDateString("he-IL")
                      : "—"}
                  </div>
                </div>
                <div style={{ color: muted, fontSize: 13 }}>
                  {item.kind} · {item.location || "—"}
                </div>
                <div style={{ fontSize: 12, color: muted }}>
                  מנהל: {item.activity_manager_name || item.lead_name || "—"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
