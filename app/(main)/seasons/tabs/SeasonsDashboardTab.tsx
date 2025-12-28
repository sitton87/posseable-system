"use client";

import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
import { SeasonPlan, ActivitySeries } from "@/type";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function SeasonsDashboardTab() {
  const [stats, setStats] = useState({
    activeSeasons: 0,
    activeSeries: 0,
    upcomingActivities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // Fetch seasons
        const seasonsRes = await fetch("/api/seasons");
        const seasonsData = await seasonsRes.json();
        const seasons = seasonsData.success ? seasonsData.seasons : [];

        // Fetch all series (we might need a dedicated endpoint for dashboard stats later, but for now we iterate)
        // Since we don't have a "get all series" easily exposed without season_id, we might rely on what we have or fetch per active season.
        // For simplicity in this iteration, let's fetch active seasons and count their series.
        
        const now = new Date();
        const activeSeasonsList = seasons.filter((s: SeasonPlan) => {
            const start = new Date(s.start_date);
            const end = new Date(s.end_date);
            return start <= now && end >= now;
        });

        // Get series for active seasons
        let totalSeries = 0;
        let totalActivities = 0; // Placeholder until we have a real count endpoint

        // For dashboard speed, we might want to add a specific stats endpoint, 
        // but let's assume 0 for now or fetch if feasible.
        // To avoid N+1 requests here, we'll just show Seasons count and maybe fetch a flat list of series if possible.
        // Alternatively, we can just show Active Seasons count which is fast.

        // Fetch activities count for this month (using the activities endpoint)
        const activitiesRes = await fetch("/api/activities");
        const activitiesData = await activitiesRes.json();
        const activities = activitiesData.success ? activitiesData.activities : [];
        
        const thisMonth = activities.filter((a: any) => {
            const d = new Date(a.activity_date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        // Fetch series count (approximated or filtered from activities unique series_id)
        // Or fetch series endpoint if it supports 'all'.
        // Let's rely on activities count as a strong metric.

        setStats({
            activeSeasons: activeSeasonsList.length,
            activeSeries: new Set(activities.map((a: any) => a.series_id)).size, // Approx active series based on activities
            upcomingActivities: thisMonth
        });

      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: spacing.lg }}>
      <KPICard 
        title="עונות פעילות" 
        value={stats.activeSeasons} 
        icon="📅"
        color={colors.primary}
      />
      <KPICard 
        title="סדרות פעילות (החודש)" 
        value={stats.activeSeries} 
        icon="🏄"
        color="#10b981"
      />
      <KPICard 
        title="פעילויות החודש" 
        value={stats.upcomingActivities} 
        icon="🌊"
        color={colors.warning}
      />
    </div>
  );
}

function KPICard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
  return (
    <Card style={{ padding: spacing.lg, display: "flex", alignItems: "center", gap: spacing.md }}>
      <div style={{ 
        width: 48, 
        height: 48, 
        borderRadius: 12, 
        backgroundColor: `${color}20`, 
        color: color,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontSize: 24
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: colors.text }}>{value}</div>
      </div>
    </Card>
  );
}

