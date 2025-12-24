"use client";

import { useState, useEffect, useRef } from "react";
import { colors, spacing } from "@/app/styles/foundations";
import { Card, Button } from "@/app/components/ui";
import { Activity } from "@/type";
import { 
  format, 
  startOfQuarter, 
  endOfQuarter, 
  getQuarter, 
  getYear, 
  addQuarters, 
  subQuarters, 
  startOfWeek, 
  endOfWeek, 
  eachWeekOfInterval,
  isSameMonth,
  addDays
} from "date-fns";
import { he } from "date-fns/locale";
import { ChevronRight, ChevronLeft } from "lucide-react";

export default function ActivitiesGanttTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      setLoading(true);
      const res = await fetch("/api/activities");
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setLoading(false);
    }
  }

  const quarterStart = startOfQuarter(currentDate);
  const quarterEnd = endOfQuarter(currentDate);
  
  // Extend view to full weeks for consistent grid
  const viewStart = startOfWeek(quarterStart, { weekStartsOn: 0 });
  const viewEnd = endOfWeek(quarterEnd, { weekStartsOn: 0 });

  const currentYear = getYear(currentDate);
  const currentQuarter = getQuarter(currentDate);

  const prevQuarter = () => setCurrentDate(subQuarters(currentDate, 1));
  const nextQuarter = () => setCurrentDate(addQuarters(currentDate, 1));

  const activitiesInView = activities.filter(a => {
    const d = new Date(a.activity_date);
    return d >= viewStart && d <= viewEnd;
  });

  const groups = Array.from(new Set(activitiesInView.map(a => a.group_name || "כללי"))).sort();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg, height: "calc(100vh - 200px)" }}>
      <Card style={{ padding: spacing.md, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>גאנט פעילויות - רבעון {currentQuarter}, {currentYear}</h2>
            <div style={{ display: "flex", gap: spacing.xs }}>
              <Button variant="outline" size="sm" onClick={prevQuarter}><ChevronRight size={16}/></Button>
              <Button variant="outline" size="sm" onClick={nextQuarter}><ChevronLeft size={16}/></Button>
            </div>
          </div>
          <div style={{ fontSize: 14, color: colors.textMuted }}>
            {format(quarterStart, "dd/MM/yyyy")} - {format(quarterEnd, "dd/MM/yyyy")}
          </div>
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: spacing.xl }}>טוען...</div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: "center", padding: spacing.xl, color: colors.textMuted }}>
            אין פעילויות ברבעון זה
          </div>
        ) : (
          <GanttView 
             viewStart={viewStart}
             viewEnd={viewEnd}
             groups={groups} 
             activities={activitiesInView} 
          />
        )}
      </Card>
    </div>
  );
}

function GanttView({ viewStart, viewEnd, groups, activities }: { viewStart: Date, viewEnd: Date, groups: string[], activities: Activity[] }) {
  const weeks = eachWeekOfInterval({ start: viewStart, end: viewEnd }, { weekStartsOn: 0 });
  // Add one extra day to end to make the duration inclusive of the last day
  const totalDuration = viewEnd.getTime() - viewStart.getTime() + (24 * 60 * 60 * 1000); 
  const sidebarWidth = 220;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header - Weeks */}
      <div style={{ display: "flex", borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.surfaceAlt }}>
        <div style={{ width: sidebarWidth, flexShrink: 0, borderRight: `1px solid ${colors.border}`, padding: spacing.sm, fontWeight: "bold", fontSize: 13, display: "flex", alignItems: "center" }}>
          קבוצה / סדרה
        </div>
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {weeks.map((weekStart, i) => (
            <div key={i} style={{ flex: 1, borderLeft: `1px solid ${colors.borderMuted}`, fontSize: 11, textAlign: "center", padding: "6px 0", position: "relative", minWidth: 40 }}>
              <div style={{ fontWeight: 600 }}>{format(weekStart, "dd/MM")}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rows Container - Scrollable */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {groups.map(group => {
          const groupActivities = activities.filter(a => (a.group_name || "כללי") === group);
          
          return (
            <div key={group} style={{ display: "flex", alignItems: "center", height: 48, borderBottom: `1px solid ${colors.borderMuted}` }}>
              <div style={{ width: sidebarWidth, flexShrink: 0, paddingLeft: spacing.sm, paddingRight: spacing.sm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", borderRight: `1px solid ${colors.border}`, fontSize: 13, fontWeight: 500 }}>
                {group}
              </div>
              <div style={{ flex: 1, position: "relative", height: "100%" }}>
                {/* Background Grid */}
                <div style={{ display: "flex", width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
                  {weeks.map((_, i) => (
                    <div key={i} style={{ flex: 1, borderLeft: `1px solid ${colors.borderMuted}` }} />
                  ))}
                </div>
                
                {/* Activities */}
                {groupActivities.map(activity => {
                  const date = new Date(activity.activity_date);
                  const offsetMillis = date.getTime() - viewStart.getTime();
                  const percent = (offsetMillis / totalDuration) * 100;
                  
                  // Safety check
                  const safePercent = Math.max(0, Math.min(100, percent));

                  return (
                    <div 
                      key={activity.id}
                      title={`${activity.kind} - ${format(date, "dd/MM/yyyy")}`}
                      style={{
                        position: "absolute",
                        left: `calc(${safePercent}% + 2px)`, // slight offset to center in day roughly or align left
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: getActivityColor(activity.kind),
                        border: "2px solid white",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        cursor: "pointer",
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ padding: spacing.md, borderTop: `1px solid ${colors.border}`, display: "flex", gap: spacing.lg, fontSize: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.primary }}></div> גלישה
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }}></div> חברתי
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors.warning }}></div> אחר
        </div>
      </div>
    </div>
  );
}

function getActivityColor(kind: string) {
  if (kind === "surf") return colors.primary;
  // Use a distinct color for social, not secondary if secondary is light
  if (kind === "social") return "#10b981"; // Emerald green
  return colors.warning;
}
