"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { colors, spacing } from "@/app/styles/foundations";
import { Card, Button } from "@/app/components/ui";
import { Activity } from "@/type";
import {
  format,
  startOfQuarter,
  endOfQuarter,
  startOfMonth,
  endOfMonth,
  getQuarter,
  getYear,
  addQuarters,
  subQuarters,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
  isSameMonth,
  addDays,
  isSameDay,
  isToday,
  isWithinInterval,
  differenceInCalendarWeeks,
  differenceInCalendarDays,
} from "date-fns";
import { he } from "date-fns/locale";
import { ChevronRight, ChevronLeft, Calendar, Grid } from "lucide-react";

type ViewMode = "quarter" | "month";

export default function ActivitiesGanttTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("quarter");

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

  // Calculate Range based on View Mode
  let viewStart, viewEnd, title;

  if (viewMode === "quarter") {
    // In quarter view, we show full weeks that cover the quarter
    const quarterStart = startOfQuarter(currentDate);
    const quarterEnd = endOfQuarter(currentDate);
    viewStart = startOfWeek(quarterStart, { weekStartsOn: 0 });
    viewEnd = endOfWeek(quarterEnd, { weekStartsOn: 0 });
    title = `רבעון ${getQuarter(currentDate)}, ${getYear(currentDate)}`;
  } else {
    // In month view, we show days of that month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    viewStart = monthStart;
    viewEnd = monthEnd;
    title = format(currentDate, "MMMM yyyy", { locale: he });
  }

  const prevPeriod = () => {
    if (viewMode === "quarter") setCurrentDate(subQuarters(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const nextPeriod = () => {
    if (viewMode === "quarter") setCurrentDate(addQuarters(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  // Filter activities strict for view range
  const activitiesInView = activities.filter((a) => {
    const d = new Date(a.activity_date);
    return d >= viewStart && d <= viewEnd;
  });

  const groups = Array.from(
    new Set(activitiesInView.map((a) => a.group_name || "כללי"))
  ).sort();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: spacing.lg,
        height: "calc(100vh - 200px)",
      }}
    >
      <Card style={{ padding: spacing.md, flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: spacing.md,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: spacing.md }}
          >
            <div style={{ display: "flex", gap: spacing.xs }}>
              <Button
                variant="secondary"
                onClick={prevPeriod}
                style={{ width: 32, height: 32, padding: 0 }}
              >
                <ChevronRight size={16} />
              </Button>
              <Button
                variant="secondary"
                onClick={nextPeriod}
                style={{ width: 32, height: 32, padding: 0 }}
              >
                <ChevronLeft size={16} />
              </Button>
            </div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
          </div>

          <div
            style={{ display: "flex", gap: spacing.sm, alignItems: "center" }}
          >
            <div
              style={{
                display: "flex",
                backgroundColor: colors.surfaceAlt,
                borderRadius: 6,
                padding: 2,
              }}
            >
              <button
                onClick={() => setViewMode("month")}
                style={{
                  padding: "4px 12px",
                  borderRadius: 4,
                  border: "none",
                  background: viewMode === "month" ? "white" : "transparent",
                  boxShadow:
                    viewMode === "month" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                  fontWeight: viewMode === "month" ? 600 : 400,
                  cursor: "pointer",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Calendar size={14} /> חודשי
              </button>
              <button
                onClick={() => setViewMode("quarter")}
                style={{
                  padding: "4px 12px",
                  borderRadius: 4,
                  border: "none",
                  background: viewMode === "quarter" ? "white" : "transparent",
                  boxShadow:
                    viewMode === "quarter"
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : "none",
                  fontWeight: viewMode === "quarter" ? 600 : 400,
                  cursor: "pointer",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Grid size={14} /> רבעוני
              </button>
            </div>
            <div
              style={{
                fontSize: 14,
                color: colors.textMuted,
                borderRight: `1px solid ${colors.borderMuted}`,
                paddingRight: spacing.sm,
              }}
            >
              {format(viewStart, "dd/MM")} - {format(viewEnd, "dd/MM")}
            </div>
          </div>
        </div>
      </Card>

      <Card
        style={{
          padding: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: spacing.xl }}>
            טוען...
          </div>
        ) : groups.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: spacing.xl,
              color: colors.textMuted,
            }}
          >
            אין פעילויות בתקופה זו
          </div>
        ) : (
          <GanttView
            viewStart={viewStart}
            viewEnd={viewEnd}
            groups={groups}
            activities={activitiesInView}
            viewMode={viewMode}
          />
        )}
      </Card>
    </div>
  );
}

function GanttView({
  viewStart,
  viewEnd,
  groups,
  activities,
  viewMode,
}: {
  viewStart: Date;
  viewEnd: Date;
  groups: string[];
  activities: Activity[];
  viewMode: ViewMode;
}) {
  const SIDEBAR_WIDTH = 200;
  const HEADER_HEIGHT = 50;
  const ROW_HEIGHT = 48;
  const router = useRouter();

  // Generate columns based on mode
  let columns: Date[] = [];
  let columnLabelFormat = "";
  let subLabelFormat = "";

  if (viewMode === "month") {
    // Daily columns for month view
    columns = eachDayOfInterval({ start: viewStart, end: viewEnd });
    columnLabelFormat = "dd";
    subLabelFormat = "EE";
  } else {
    // Weekly columns for quarter view
    columns = eachWeekOfInterval(
      { start: viewStart, end: viewEnd },
      { weekStartsOn: 0 }
    );
    columnLabelFormat = "dd/MM";
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Sidebar (Fixed) */}
      <div
        style={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderLeft: `1px solid ${colors.border}`, // Border on left side for RTL separation
          backgroundColor: "white",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-2px 0 5px rgba(0,0,0,0.05)", // Shadow to the left
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            height: HEADER_HEIGHT,
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            padding: spacing.sm,
            fontWeight: "bold",
            fontSize: 13,
            backgroundColor: colors.surfaceAlt,
          }}
        >
          קבוצה / סדרה
        </div>

        {/* Sidebar Rows */}
        <div style={{ overflowY: "hidden" }}>
          {groups.map((group) => (
            <div
              key={group}
              onClick={() =>
                router.push("/activities?tab=planning&subtab=series")
              }
              title="לחץ למעבר לניהול סדרות"
              style={{
                height: ROW_HEIGHT,
                borderBottom: `1px solid ${colors.borderMuted}`,
                padding: `0 ${spacing.sm}`,
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
                color: colors.primary,
                textDecoration: "underline",
              }}
            >
              {group}
            </div>
          ))}
        </div>
      </div>

      {/* Main Area - Flex columns to fit screen */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header - Columns */}
        <div
          style={{
            display: "flex",
            height: HEADER_HEIGHT,
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.surfaceAlt,
          }}
        >
          {columns.map((colDate, i) => {
            const isTodayDate = isToday(colDate);
            const showMonthLabel =
              viewMode === "quarter" && colDate.getDate() <= 7;

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderLeft: `1px solid ${colors.borderMuted}`,
                  fontSize: 11,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  backgroundColor: isTodayDate
                    ? "rgba(59, 130, 246, 0.1)"
                    : undefined,
                  position: "relative",
                  minWidth: 0, // Allow shrinking
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: isTodayDate ? colors.primary : undefined,
                  }}
                >
                  {format(colDate, columnLabelFormat)}
                </div>
                {subLabelFormat && (
                  <div style={{ fontSize: 10, color: colors.textMuted }}>
                    {format(colDate, subLabelFormat, { locale: he })}
                  </div>
                )}
                {showMonthLabel && (
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      fontSize: 9,
                      fontWeight: "bold",
                      color: colors.primary,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {format(colDate, "MMM", { locale: he })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid Rows */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {groups.map((group) => {
            const groupActivities = activities.filter(
              (a) => (a.group_name || "כללי") === group
            );

            return (
              <div
                key={group}
                style={{
                  height: ROW_HEIGHT,
                  borderBottom: `1px solid ${colors.borderMuted}`,
                  position: "relative",
                  display: "flex",
                }}
              >
                {/* Vertical Grid Lines - Using Flex to match header */}
                {columns.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      borderLeft: `1px solid ${colors.borderMuted}`,
                      height: "100%",
                      opacity: 0.5,
                    }}
                  />
                ))}

                {/* Activity Markers */}
                {groupActivities.map((activity) => {
                  const actDate = new Date(activity.activity_date);
                  let leftPercent = 0;
                  const totalColumns = columns.length;
                  let colIndex = 0;

                  // Use exact column index matching for precision
                  if (viewMode === "month") {
                    colIndex = differenceInCalendarDays(actDate, viewStart);
                  } else {
                    // Quarter view (Weeks) - Ensure we match the exact week column
                    colIndex = differenceInCalendarWeeks(actDate, viewStart, {
                      weekStartsOn: 0,
                    });
                  }

                  // Center in the column
                  const percent = ((colIndex + 0.5) / totalColumns) * 100;

                  // Safety bounds
                  if (percent < 0 || percent > 100) return null;

                  return (
                    <div
                      key={activity.id}
                      title={`${activity.kind} - ${format(
                        actDate,
                        "dd/MM/yyyy"
                      )}\n${activity.start_time || ""} - ${
                        activity.end_time || ""
                      }\n${activity.location || ""}`}
                      style={{
                        position: "absolute",
                        right: `${percent}%`, // Changed from left to right for RTL
                        top: "50%",
                        transform: "translate(50%, -50%)", // Adjust translate direction
                        width: viewMode === "month" ? 16 : 12,
                        height: viewMode === "month" ? 16 : 12,
                        borderRadius: "50%",
                        background: getActivityColor(activity.kind),
                        border: "2px solid white",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        cursor: "pointer",
                        zIndex: 2,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTop: `1px solid ${colors.border}`,
          padding: spacing.md,
          display: "flex",
          gap: spacing.lg,
          fontSize: 12,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: colors.primary,
            }}
          ></div>{" "}
          גלישה
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#10b981",
            }}
          ></div>{" "}
          חברתי
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#8b5cf6",
            }}
          ></div>{" "}
          אירוע מיוחד
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#f59e0b",
            }}
          ></div>{" "}
          הכשרה והדרכה
        </div>
      </div>
    </div>
  );
}

function getActivityColor(kind: string) {
  if (kind === "גלישה" || kind === "surf") return colors.primary;
  if (kind === "חברתי" || kind === "social") return "#10b981"; // Emerald
  if (kind === "special") return "#8b5cf6"; // Violet
  if (kind === "training" || kind === "lecture") return "#f59e0b"; // Amber
  return "#6b7280"; // Gray for other/unknown
}
