"use client";

import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui";
import { colors, spacing, radii } from "@/app/styles/foundations";
import { SeasonPlan } from "@/type";
import { StatCardGrid, TasksBoard, SmallActionButton } from "@/app/components/shared";

const muted = colors.textMuted;

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
            upcomingActivities: thisMonth
        });
        setRecentActivities(sortedActivities);

      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
  }

  const statCards = [
    { label: "עונות פעילות", value: stats.activeSeasons },
    { label: "סדרות פעילות (החודש)", value: stats.activeSeries },
    { label: "פעילויות החודש", value: stats.upcomingActivities },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      {/* KPIs Card */}
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
            <h3 style={{ margin: 0 }}>מבט כללי · עונות ופעילויות</h3>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              סיכום נתונים מרכזיים
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

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: spacing.lg }}>
          
          {/* Left Column: Tasks Board */}
          <TasksBoard 
                entityType="season_general" 
                title="משימות ניהול עונות" 
          />

          {/* Right Column: Recent Activities */}
          <Card style={{ padding: spacing.lg }}>
             <h4 style={{ margin: "0 0 12px 0" }}>פעילויות שנוצרו לאחרונה</h4>
             <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                {recentActivities.length === 0 && (
                  <div style={{ color: muted, fontSize: 13 }}>
                    לא נמצאו פעילויות חדשות.
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
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                        <span style={{ 
                            padding: "2px 6px", 
                            borderRadius: 4, 
                            background: "rgba(0,0,0,0.05)",
                            marginRight: 4
                        }}>
                            {item.status}
                        </span>
                    </div>
                  </div>
                ))}
             </div>
          </Card>
      </div>
    </div>
  );
}
