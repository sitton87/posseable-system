"use client";

import { cssVar } from "@/app/styles/design-system";
import { Section } from "@/app/components/shared/layoutPrimitives";
import { useState, useEffect } from "react";
import { Activity } from "@/type";
import { format } from "date-fns";
import { Card, Title, Text, Button } from "@tremor/react";
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
    <div className="flex flex-col gap-6">
      <Section title={`פעילויות היום (${new Date().toLocaleDateString('he-IL')})`}>
        {loading ? (
          <Text>טוען...</Text>
        ) : todaysActivities.length === 0 ? (
          <Text className="p-4" style={{ color: cssVar.text.muted }}>אין פעילויות להיום</Text>
        ) : (
          todaysActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} onSelect={() => navigateToActivity(activity.id)} isToday />
          ))
        )}
      </Section>

      <Section title="פעילויות עתידיות">
        {loading ? (
          <Text>טוען...</Text>
        ) : futureActivities.length === 0 ? (
          <Text className="p-4" style={{ color: cssVar.text.muted }}>אין פעילויות עתידיות</Text>
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
    <Card 
      className="p-4 mb-4 cursor-pointer transition-transform hover:-translate-y-0.5"
      style={{ 
        borderRight: isToday ? `4px solid ${cssVar.brand.primary}` : undefined,
      }}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div>
          <Title>{activity.group_name || "פעילות כללית"}</Title>
          <Text style={{ color: cssVar.text.muted }}>
            {format(new Date(activity.activity_date), "dd/MM/yyyy")} | {activity.start_time?.slice(0, 5)} - {activity.end_time?.slice(0, 5)}
          </Text>
          <Text className="mt-1">{activity.location} | {activity.kind}</Text>
          <Text className="text-sm mt-1" style={{ color: cssVar.text.muted }}>
            מנהל: {activity.activity_manager_name || "לא משובץ"}
          </Text>
        </div>
        
        <Button onClick={(e) => { e.stopPropagation(); onSelect(); }} variant={isToday ? "primary" : "secondary"}>
          פרטי פעילות
        </Button>
      </div>
    </Card>
  );
}
