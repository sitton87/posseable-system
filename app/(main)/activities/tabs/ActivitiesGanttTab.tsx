"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Title, Text, Button } from "@tremor/react";
import { cssVar, numericValues } from "@/app/styles/design-system";
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
  isToday,
  differenceInCalendarWeeks,
  differenceInCalendarDays,
} from "date-fns";
import { he } from "date-fns/locale";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CalendarIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

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

  let viewStart, viewEnd, title;

  if (viewMode === "quarter") {
    const quarterStart = startOfQuarter(currentDate);
    const quarterEnd = endOfQuarter(currentDate);
    viewStart = startOfWeek(quarterStart, { weekStartsOn: 0 });
    viewEnd = endOfWeek(quarterEnd, { weekStartsOn: 0 });
    title = `רבעון ${getQuarter(currentDate)}, ${getYear(currentDate)}`;
  } else {
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

  const activitiesInView = activities.filter((a) => {
    const d = new Date(a.activity_date);
    return d >= viewStart && d <= viewEnd;
  });

  const groups = Array.from(
    new Set(activitiesInView.map((a) => a.group_name || "כללי"))
  ).sort();

  return (
    <div
      className="flex flex-col gap-5"
      style={{ height: "calc(100vh - 200px)" }}
    >
      <Card className="p-4 flex-shrink-0">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <Button
                variant="secondary"
                size="xs"
                icon={ChevronRightIcon}
                onClick={prevPeriod}
              />
              <Button
                variant="secondary"
                size="xs"
                icon={ChevronLeftIcon}
                onClick={nextPeriod}
              />
            </div>
            <Title>{title}</Title>
          </div>

          <div className="flex gap-3 items-center">
            <div
              className="flex rounded-md p-0.5"
              style={{ backgroundColor: cssVar.bg.surfaceAlt }}
            >
              <button
                onClick={() => setViewMode("month")}
                className="px-3 py-1 rounded text-sm flex items-center gap-1.5 border-0 cursor-pointer"
                style={{
                  background: viewMode === "month" ? "white" : "transparent",
                  boxShadow:
                    viewMode === "month" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                  fontWeight: viewMode === "month" ? 600 : 400,
                }}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> חודשי
              </button>
              <button
                onClick={() => setViewMode("quarter")}
                className="px-3 py-1 rounded text-sm flex items-center gap-1.5 border-0 cursor-pointer"
                style={{
                  background: viewMode === "quarter" ? "white" : "transparent",
                  boxShadow:
                    viewMode === "quarter"
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : "none",
                  fontWeight: viewMode === "quarter" ? 600 : 400,
                }}
              >
                <Squares2X2Icon className="w-3.5 h-3.5" /> רבעוני
              </button>
            </div>
            <Text
              className="text-sm pr-3"
              style={{
                color: cssVar.text.muted,
                borderRight: `1px solid ${cssVar.border.secondary}`,
              }}
            >
              {format(viewStart, "dd/MM")} - {format(viewEnd, "dd/MM")}
            </Text>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden flex flex-col flex-1">
        {loading ? (
          <div className="text-center p-8">
            <Text>טוען...</Text>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center p-8">
            <Text style={{ color: cssVar.text.muted }}>אין פעילויות בתקופה זו</Text>
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

  let columns: Date[] = [];
  let columnLabelFormat = "";
  let subLabelFormat = "";

  if (viewMode === "month") {
    columns = eachDayOfInterval({ start: viewStart, end: viewEnd });
    columnLabelFormat = "dd";
    subLabelFormat = "EE";
  } else {
    columns = eachWeekOfInterval(
      { start: viewStart, end: viewEnd },
      { weekStartsOn: 0 }
    );
    columnLabelFormat = "dd/MM";
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar (Fixed) */}
      <div
        className="flex-shrink-0 flex flex-col z-10"
        style={{
          width: SIDEBAR_WIDTH,
          borderLeft: `1px solid ${cssVar.border.primary}`,
          backgroundColor: "white",
          boxShadow: "-2px 0 5px rgba(0,0,0,0.05)",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center px-3 font-bold text-sm"
          style={{
            height: HEADER_HEIGHT,
            borderBottom: `1px solid ${cssVar.border.primary}`,
            backgroundColor: cssVar.bg.surfaceAlt,
          }}
        >
          קבוצה / סדרה
        </div>

        {/* Sidebar Rows */}
        <div className="overflow-y-hidden">
          {groups.map((group) => (
            <div
              key={group}
              onClick={() =>
                router.push("/activities?tab=planning&subtab=series")
              }
              title="לחץ למעבר לניהול סדרות"
              className="flex items-center px-3 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer underline"
              style={{
                height: ROW_HEIGHT,
                borderBottom: `1px solid ${cssVar.border.secondary}`,
                color: cssVar.brand.primary,
              }}
            >
              {group}
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Columns */}
        <div
          className="flex"
          style={{
            height: HEADER_HEIGHT,
            borderBottom: `1px solid ${cssVar.border.primary}`,
            backgroundColor: cssVar.bg.surfaceAlt,
          }}
        >
          {columns.map((colDate, i) => {
            const isTodayDate = isToday(colDate);
            const showMonthLabel =
              viewMode === "quarter" && colDate.getDate() <= 7;

            return (
              <div
                key={i}
                className="flex-1 flex flex-col justify-center text-center text-xs relative min-w-0"
                style={{
                  borderLeft: `1px solid ${cssVar.border.secondary}`,
                  backgroundColor: isTodayDate
                    ? "rgba(59, 130, 246, 0.1)"
                    : undefined,
                }}
              >
                <div
                  className="font-semibold"
                  style={{
                    color: isTodayDate ? cssVar.brand.primary : undefined,
                  }}
                >
                  {format(colDate, columnLabelFormat)}
                </div>
                {subLabelFormat && (
                  <div style={{ fontSize: 10, color: cssVar.text.muted }}>
                    {format(colDate, subLabelFormat, { locale: he })}
                  </div>
                )}
                {showMonthLabel && (
                  <div
                    className="absolute top-0.5 right-0.5 text-[9px] font-bold whitespace-nowrap"
                    style={{ color: cssVar.brand.primary }}
                  >
                    {format(colDate, "MMM", { locale: he })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grid Rows */}
        <div className="flex-1 overflow-y-auto">
          {groups.map((group) => {
            const groupActivities = activities.filter(
              (a) => (a.group_name || "כללי") === group
            );

            return (
              <div
                key={group}
                className="relative flex"
                style={{
                  height: ROW_HEIGHT,
                  borderBottom: `1px solid ${cssVar.border.secondary}`,
                }}
              >
                {/* Vertical Grid Lines */}
                {columns.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-full opacity-50"
                    style={{
                      borderLeft: `1px solid ${cssVar.border.secondary}`,
                    }}
                  />
                ))}

                {/* Activity Markers */}
                {groupActivities.map((activity) => {
                  const actDate = new Date(activity.activity_date);
                  const totalColumns = columns.length;
                  let colIndex = 0;

                  if (viewMode === "month") {
                    colIndex = differenceInCalendarDays(actDate, viewStart);
                  } else {
                    colIndex = differenceInCalendarWeeks(actDate, viewStart, {
                      weekStartsOn: 0,
                    });
                  }

                  const percent = ((colIndex + 0.5) / totalColumns) * 100;

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
                      className="absolute cursor-pointer z-[2]"
                      style={{
                        right: `${percent}%`,
                        top: "50%",
                        transform: "translate(50%, -50%)",
                        width: viewMode === "month" ? 16 : 12,
                        height: viewMode === "month" ? 16 : 12,
                        borderRadius: "50%",
                        background: getActivityColor(activity.kind),
                        border: "2px solid white",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
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
        className="absolute bottom-0 left-0 right-0 flex gap-6 text-xs z-20 p-4"
        style={{
          backgroundColor: "white",
          borderTop: `1px solid ${cssVar.border.primary}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: cssVar.brand.primary }}
          ></div>{" "}
          גלישה
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#10b981" }}
          ></div>{" "}
          חברתי
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#8b5cf6" }}
          ></div>{" "}
          אירוע מיוחד
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "#f59e0b" }}
          ></div>{" "}
          הכשרה והדרכה
        </div>
      </div>
    </div>
  );
}

function getActivityColor(kind: string) {
  if (kind === "גלישה" || kind === "surf") return cssVar.brand.primary;
  if (kind === "חברתי" || kind === "social") return "#10b981";
  if (kind === "special") return "#8b5cf6";
  if (kind === "training" || kind === "lecture") return "#f59e0b";
  return "#6b7280";
}
