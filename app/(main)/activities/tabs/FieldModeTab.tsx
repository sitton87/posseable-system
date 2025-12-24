"use client";

import { colors, spacing } from "@/app/styles/foundations";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { useState, useEffect } from "react";
import { Activity } from "@/type";
import { format } from "date-fns";
import { Card, Button } from "@/app/components/ui";
import { useRouter } from "next/navigation";

export default function FieldStatusTab() {
  const router = useRouter();
  const [todaysActivities, setTodaysActivities] = useState<Activity[]>([]);
  const [futureActivities, setFutureActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      setLoading(true);
      // Fetch all planned activities
      const res = await fetch("/api/activities?status=Planned");
      const data = await res.json();
      if (data.success) {
        const all: Activity[] = data.activities;
        const todayStr = new Date().toISOString().split('T')[0];
        
        const today = all.filter(a => a.activity_date.toString().startsWith(todayStr));
        const future = all.filter(a => a.activity_date.toString() > todayStr).sort((a, b) => 
          new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime()
        );

        setTodaysActivities(today);
        setFutureActivities(future);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const navigateToActivity = (id: number) => {
    router.push(`/activities/${id}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
      <Section title={`פעילויות היום (${new Date().toLocaleDateString('he-IL')})`}>
        {loading ? (
          <div>טוען...</div>
        ) : todaysActivities.length === 0 ? (
          <div style={{ padding: spacing.md, color: colors.textMuted }}>אין פעילויות להיום</div>
        ) : (
          todaysActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} onSelect={() => navigateToActivity(activity.id)} isToday />
          ))
        )}
      </Section>

      <Section title="פעילויות עתידיות">
        {loading ? (
          <div>טוען...</div>
        ) : futureActivities.length === 0 ? (
          <div style={{ padding: spacing.md, color: colors.textMuted }}>אין פעילויות עתידיות</div>
        ) : (
          futureActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} onSelect={() => navigateToActivity(activity.id)} />
          ))
        )}
      </Section>
    </div>
  );
}

function ActivityCard({ activity, onSelect, isToday }: { activity: Activity; onSelect: () => void; isToday?: boolean }) {
  return (
    <div style={{ 
      background: "white", 
      padding: spacing.lg, 
      borderRadius: 8, 
      border: `1px solid ${colors.border}`,
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      marginBottom: spacing.md,
      borderRight: isToday ? `4px solid ${colors.primary}` : undefined,
      cursor: "pointer",
      transition: "transform 0.1s"
    }}
    onClick={onSelect}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>{activity.group_name || "פעילות כללית"}</div>
          <div style={{ color: colors.textMuted }}>
            {format(new Date(activity.activity_date), "dd/MM/yyyy")} | {activity.start_time?.slice(0, 5)} - {activity.end_time?.slice(0, 5)}
          </div>
          <div style={{ marginTop: 4 }}>{activity.location} | {activity.kind}</div>
          <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
            מנהל: {activity.activity_manager_name || "לא משובץ"}
          </div>
        </div>
        
        <Button onClick={(e) => { e.stopPropagation(); onSelect(); }} variant={isToday ? "primary" : "outline"}>
          פרטי פעילות
        </Button>
      </div>
    </div>
  );
}
