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
import { toast } from "sonner";

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
    sort: "date_desc"
  });

  useEffect(() => {
    fetchActivities();
  }, [filters.status, filters.kind, filters.sort]);

  async function fetchActivities() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.kind) params.set("kind", filters.kind);
      if (filters.sort) params.set("sort", filters.sort);

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

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    if (!confirm("האם אתה בטוח שברצונך למחוק פעילות זו?")) return;

    try {
      const res = await fetch(`/api/activities/update?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("פעילות נמחקה בהצלחה");
        fetchActivities();
      } else {
        toast.error("שגיאה במחיקת הפעילות");
      }
    } catch (err) {
      toast.error("שגיאה במחיקת הפעילות");
    }
  };

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
            onClick={() => setFilters({ status: "", kind: "", search: "", sort: "date_desc" })}
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
          <option value="lecture">הדרכה/הרצאה</option>
          <option value="preparation">הכנה</option>
          <option value="special">אירוע מיוחד</option>
          <option value="other">אחר</option>
        </select>
        <select
          style={filterControlStyle}
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="date_desc">תאריך (מהחדש לישן)</option>
          <option value="date_asc">תאריך (מהישן לחדש)</option>
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
                <tr 
                    key={activity.id} 
                    onClick={() => router.push(`/activities/${activity.id}`)}
                    style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.surfaceAlt}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={tableCellStyle}>
                    {format(new Date(activity.activity_date), "dd/MM/yyyy")}
                  </td>
                  <td style={tableCellStyle}>
                    {formatTime(activity.start_time)}
                  </td>
                  <td style={{ ...tableCellStyle, fontWeight: 700 }}>
                    {activity.group_name || "-"}
                  </td>
                  <td style={tableCellStyle}>{
                    activity.kind === "surf" ? "גלישה" :
                    activity.kind === "social" ? "חברתי" :
                    activity.kind === "lecture" ? "הדרכה/הרצאה" :
                    activity.kind === "preparation" ? "הכנה" :
                    activity.kind === "special" ? "אירוע מיוחד" :
                    activity.kind === "other" ? "אחר" :
                    activity.kind
                  }</td>
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
                        onClick={(e) => { e.stopPropagation(); router.push(`/activities/${activity.id}`); }}
                      >
                        ניהול
                      </SmallActionButton>
                      <SmallActionButton
                        variant="secondary"
                        style={{ color: colors.danger, borderColor: colors.danger + "40", backgroundColor: colors.danger + "10" }}
                        onClick={(e) => handleDelete(activity.id, e)}
                      >
                        מחיקה
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
