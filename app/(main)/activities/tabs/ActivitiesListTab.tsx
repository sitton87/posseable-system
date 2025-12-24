"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors, spacing } from "@/app/styles/foundations";
import { Button, Card } from "@/app/components/ui";
import { Activity } from "@/type";
import { SmallActionButton, FilterToolbar, StatusPill } from "@/app/components/shared";
import {
  filterControlStyle,
  tableCellStyle,
  tableHeaderStyle,
  tableStyle,
} from "@/app/styles/components";
import { format } from "date-fns";

const muted = colors.textMuted;

// Helper to format time strings (HH:mm:ss -> HH:mm)
const formatTime = (timeStr?: string) => {
  if (!timeStr) return "-";
  return timeStr.slice(0, 5);
};

export default function ActivitiesListTab() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    kind: "",
    search: "",
  });

  useEffect(() => {
    fetchActivities();
  }, [filters.status, filters.kind]);

  async function fetchActivities() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.kind) params.set("kind", filters.kind);

      const res = await fetch(`/api/activities?${params.toString()}`);
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

  const filteredActivities = activities.filter((activity) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      activity.group_name?.toLowerCase().includes(searchLower) ||
      activity.location?.toLowerCase().includes(searchLower) ||
      activity.lead_name?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusTone = (status: string): "success" | "warning" | "error" | "info" | "neutral" => {
    switch (status) {
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      case "In Progress":
        return "info";
      default:
        return "neutral";
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      Planned: "מתוכנן",
      Completed: "הושלם",
      Cancelled: "בוטל",
      "In Progress": "בביצוע",
    };
    return map[status] || status;
  };

  return (
    <Card
      style={{
        padding: spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: spacing.sm,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>רשימת פעילויות</h2>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            ניהול ומעקב אחר פעילויות העמותה
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: spacing.sm,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <SmallActionButton variant="secondary" onClick={fetchActivities}>
            רענן
          </SmallActionButton>
          <SmallActionButton 
            variant="secondary" 
            onClick={() => setFilters({ status: "", kind: "", search: "" })}
          >
            ניקוי פילטרים
          </SmallActionButton>
          <Button onClick={() => router.push("/activities/new")}>+ פעילות חדשה</Button>
        </div>
      </div>

      <FilterToolbar columns="repeat(auto-fit, minmax(200px, 1fr))">
        <input
          style={filterControlStyle}
          placeholder="חיפוש לפי קבוצה, מיקום או מנהל..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          style={filterControlStyle}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">כל הסטטוסים</option>
          <option value="Planned">מתוכנן</option>
          <option value="Completed">הושלם</option>
          <option value="Cancelled">בוטל</option>
        </select>
        <select
          style={filterControlStyle}
          value={filters.kind}
          onChange={(e) => setFilters({ ...filters, kind: e.target.value })}
        >
          <option value="">כל הסוגים</option>
          <option value="surf">גלישה</option>
          <option value="social">חברתי</option>
        </select>
      </FilterToolbar>

      {loading ? (
        <div style={{ textAlign: "center", padding: spacing.xl, color: colors.textMuted }}>טוען פעילויות...</div>
      ) : filteredActivities.length === 0 ? (
        <div style={{ textAlign: "center", padding: spacing.xl, color: colors.textMuted }}>לא נמצאו פעילויות</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>תאריך</th>
                <th style={tableHeaderStyle}>שעה</th>
                <th style={tableHeaderStyle}>קבוצה</th>
                <th style={tableHeaderStyle}>סוג</th>
                <th style={tableHeaderStyle}>מיקום</th>
                <th style={tableHeaderStyle}>מנהל</th>
                <th style={tableHeaderStyle}>משתתפים</th>
                <th style={tableHeaderStyle}>סטטוס</th>
                <th style={tableHeaderStyle}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((activity) => (
                <tr key={activity.id}>
                  <td style={tableCellStyle}>
                    {format(new Date(activity.activity_date), "dd/MM/yyyy")}
                  </td>
                  <td style={tableCellStyle}>
                    {formatTime(activity.start_time)}
                  </td>
                  <td style={{ ...tableCellStyle, fontWeight: 700 }}>
                    {activity.group_name || "-"}
                  </td>
                  <td style={tableCellStyle}>{activity.kind}</td>
                  <td style={tableCellStyle}>{activity.location || "-"}</td>
                  <td style={tableCellStyle}>
                    {activity.activity_manager_name || activity.lead_name || "-"}
                  </td>
                  <td style={tableCellStyle}>{activity.participant_count || 0}</td>
                  <td style={tableCellStyle}>
                    <StatusPill tone={getStatusTone(activity.status)}>
                      {getStatusLabel(activity.status)}
                    </StatusPill>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                      <SmallActionButton
                        variant="secondary"
                        onClick={() => router.push(`/activities/${activity.id}`)}
                      >
                        ניהול
                      </SmallActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
