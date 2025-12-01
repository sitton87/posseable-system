"use client";

import type { CSSProperties } from "react";
import { useState, useEffect } from "react";
import { Activity, SeasonPlan, ActivitySeries } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import {
  inputStyle,
  labelStyle,
  withCenteredControl,
} from "@/app/styles/components";
import { colors, radii, spacing } from "@/app/styles/foundations";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;
const filterControlStyle = withCenteredControl(inputStyle);

function parseTimeValue(value?: string | null) {
  if (!value) return null;

  let normalized = value;

  if (!value.includes("T")) {
    // Support HH:mm or HH:mm:ss formats
    normalized = value.length === 5 ? `${value}:00` : value;
    normalized = `1970-01-01T${normalized}`;
  }

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDuration(start?: string | null, end?: string | null) {
  const startDate = parseTimeValue(start);
  const endDate = parseTimeValue(end);

  if (!startDate || !endDate) {
    return "—";
  }

  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs <= 0) {
    return "—";
  }

  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} שעות ${minutes} דק'`;
  }

  if (hours > 0) {
    return hours === 1 ? "שעה" : `${hours} שעות`;
  }

  return `${minutes} דק'`;
}
const sectionBoxStyle: CSSProperties = {
  marginBottom: spacing.lg,
  padding: spacing.lg,
  background: colors.surfaceAlt,
  borderRadius: radii.card,
};
const smallButtonStyle: CSSProperties = {
  fontSize: 12,
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
};
const statusStyles: Record<string, { background: string; color: string }> = {
  הושלם: { background: colors.successSoft, color: colors.success },
  פעיל: { background: colors.primarySoft, color: colors.primary },
  מתוכנן: { background: "rgba(251, 191, 36, 0.15)", color: "#d97706" },
  בוטל: { background: colors.dangerSoft, color: colors.danger },
};
const defaultStatusStyle = {
  background: colors.borderMuted,
  color: colors.textPrimary,
};
const getStatusStyle = (status: string) =>
  statusStyles[status] || defaultStatusStyle;
const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("he-IL") : "—";
const formatTimeRange = (start?: string | null, end?: string | null) => {
  if (start && end) return `${start}-${end}`;
  return start || end || "—";
};

const ACTIVITY_KINDS = [
  "גלישה",
  "הכנה",
  "אירוע מיוחד",
  "הדרכה",
  "אחר",
] as const;

const ACTIVITY_STATUS = ["מתוכנן", "פעיל", "הושלם", "בוטל"] as const;

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [filterKind, setFilterKind] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [seasonsOptions, setSeasonsOptions] = useState<SeasonPlan[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<ActivitySeries[]>([]);
  const [seriesOptionsLoading, setSeriesOptionsLoading] = useState(false);

  const [formData, setFormData] = useState({
    season_id: "",
    series_id: "",
    group_id: "",
    kind: "גלישה",
    activity_date: "",
    start_time: "",
    end_time: "",
    location: "",
    capacity: "",
    status: "מתוכנן",
    notes: "",
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [filterKind, filterStatus]);

  const fetchSeasons = async () => {
    try {
      const res = await fetch("/api/seasons", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSeasonsOptions(data.seasons);
      }
    } catch (err) {
      console.error("Error fetching seasons:", err);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let url = "/api/activities";
      const params = new URLSearchParams();
      if (filterKind) params.append("kind", filterKind);
      if (filterStatus) params.append("status", filterStatus);
      if (params.toString()) url += `?${params}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      alert("שגיאה בטעינת פעילויות");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeriesOptions = async (
    seasonId: string,
    options?: { presetSeriesId?: string; autoSelectDefault?: boolean }
  ) => {
    if (!seasonId) {
      setSeriesOptions([]);
      setFormData((prev) => ({ ...prev, series_id: "" }));
      return;
    }
    try {
      setSeriesOptionsLoading(true);
      const res = await fetch(`/api/series?season_id=${seasonId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSeriesOptions(data.series);
        if (options?.presetSeriesId) {
          setFormData((prev) => ({
            ...prev,
            series_id: options.presetSeriesId as string,
          }));
        } else if (options?.autoSelectDefault) {
          const defaultSeries =
            data.series.find((s: ActivitySeries) => s.is_default) ||
            data.series[0];
          setFormData((prev) => ({
            ...prev,
            series_id: defaultSeries ? defaultSeries.id.toString() : "",
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching series options:", err);
      alert("שגיאה בטעינת סדרות פעילות");
    } finally {
      setSeriesOptionsLoading(false);
    }
  };

  const handleSeasonSelect = (seasonId: string) => {
    setFormData((prev) => ({ ...prev, season_id: seasonId, series_id: "" }));
    if (seasonId) {
      fetchSeriesOptions(seasonId, { autoSelectDefault: true });
    } else {
      setSeriesOptions([]);
    }
  };

  const handleView = (activity: Activity) => {
    setViewingActivity(activity);
    setShowViewModal(true);
  };
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingActivity(null);
  };

  const handleAdd = () => {
    setEditingActivity(null);
    setFormData({
      season_id: "",
      series_id: "",
      group_id: "",
      kind: "גלישה",
      activity_date: "",
      start_time: "",
      end_time: "",
      location: "",
      capacity: "",
      status: "מתוכנן",
      notes: "",
    });
    setSeriesOptions([]);
    setShowModal(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      season_id: activity.season_id.toString(),
      series_id: activity.series_id?.toString() || "",
      group_id: activity.group_id || "",
      kind: activity.kind,
      activity_date: activity.activity_date.toString().split("T")[0],
      start_time: activity.start_time || "",
      end_time: activity.end_time || "",
      location: activity.location || "",
      capacity: activity.capacity?.toString() || "",
      status: activity.status,
      notes: activity.notes || "",
    });
    setShowModal(true);
    fetchSeriesOptions(activity.season_id.toString(), {
      presetSeriesId: activity.series_id?.toString() || "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.season_id || !formData.activity_date) {
      alert("עונה ותאריך הם שדות חובה");
      return;
    }
    if (!formData.series_id) {
      alert("יש לבחור סדרת פעילויות");
      return;
    }

    try {
      const url = editingActivity
        ? "/api/activities/update"
        : "/api/activities/add";
      const method = editingActivity ? "PUT" : "POST";
      const seasonIdNumber = parseInt(formData.season_id, 10);
      const seriesIdNumber = parseInt(formData.series_id, 10);

      const body: any = {
        season_id: seasonIdNumber,
        series_id: seriesIdNumber,
        group_id: formData.group_id || null,
        kind: formData.kind,
        activity_date: formData.activity_date,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        location: formData.location || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (editingActivity) {
        body.id = editingActivity.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(
          editingActivity ? "פעילות עודכנה בהצלחה!" : "פעילות נוספה בהצלחה!"
        );
        setShowModal(false);
        fetchActivities();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving activity:", err);
      alert("שגיאה בשמירת פעילות");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הפעילות?")) return;

    try {
      const res = await fetch(`/api/activities/update?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("פעילות נמחקה בהצלחה!");
        fetchActivities();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
      alert("שגיאה במחיקת פעילות");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div>טוען פעילויות...</div>
      </div>
    );
  }

  // Count by kind
  const kindCounts: Record<string, number> = {};
  activities.forEach((a) => {
    kindCounts[a.kind] = (kindCounts[a.kind] || 0) + 1;
  });

  return (
    <div style={{ padding: spacing.xl }}>
      {/* Header */}
      <Card style={{ marginBottom: spacing.lg }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.md,
            gap: spacing.md,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              📅 ניהול פעילויות
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {activities.length} פעילויות במערכת
            </div>
          </div>
          <Button onClick={handleAdd}>+ הוסף פעילות</Button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div>
            <label style={labelStyle}>סוג פעילות</label>
            <select
              style={filterControlStyle}
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value)}
            >
              <option value="">כל הסוגים</option>
              {ACTIVITY_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k} ({kindCounts[k] || 0})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>סטטוס פעילות</label>
            <select
              style={filterControlStyle}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">כל הסטטוסים</option>
              {ACTIVITY_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 8px",
            }}
          >
            <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
              <tr style={{ color: muted, fontSize: 13 }}>
                <th style={{ textAlign: "center", padding: 8 }}>סוג</th>
                <th style={{ textAlign: "center", padding: 8 }}>סדרה</th>
                <th style={{ textAlign: "center", padding: 8 }}>תאריך</th>
                <th style={{ textAlign: "center", padding: 8 }}>משך</th>
                <th style={{ textAlign: "center", padding: 8 }}>מיקום</th>
                <th style={{ textAlign: "center", padding: 8 }}>קבוצה</th>
                <th style={{ textAlign: "center", padding: 8 }}>קיבולת</th>
                <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr
                  key={a.id}
                  style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
                >
                  <td style={{ padding: 8, fontWeight: 600 }}>{a.kind}</td>
                  <td style={{ padding: 8, color: muted }}>
                    {a.series_name || `סדרה #${a.series_id}`}
                  </td>
                  <td style={{ padding: 8, color: muted }}>
                    {new Date(a.activity_date).toLocaleDateString("he-IL")}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: 8,
                      fontSize: 13,
                      color: muted,
                    }}
                  >
                    {formatDuration(a.start_time, a.end_time)}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                    {a.location || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                    {a.group_name || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    {a.capacity || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: radii.button,
                        fontSize: 12,
                        fontWeight: 600,
                        ...getStatusStyle(a.status),
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: 4 }}
                      onClick={() => handleView(a)}
                    >
                      👁️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: 4 }}
                      onClick={() => handleEdit(a)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, color: colors.danger }}
                      onClick={() => handleDelete(a.id)}
                    >
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין פעילויות במערכת. לחץ על "הוסף פעילות" להתחיל.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        width="min(720px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800 }}>
          {editingActivity ? "ערוך פעילות" : "הוסף פעילות חדשה"}
        </h3>

        {/* Basic Info */}
        <div style={sectionBoxStyle}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
            📋 פרטים בסיסיים
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>
                סוג פעילות <span style={{ color: colors.danger }}>*</span>
              </label>
              <select
                style={inputStyle}
                value={formData.kind}
                onChange={(e) =>
                  setFormData({ ...formData, kind: e.target.value })
                }
              >
                {ACTIVITY_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                סטטוס <span style={{ color: colors.danger }}>*</span>
              </label>
              <select
                style={inputStyle}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                {ACTIVITY_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                תאריך <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                type="date"
                style={inputStyle}
                value={formData.activity_date}
                onChange={(e) =>
                  setFormData({ ...formData, activity_date: e.target.value })
                }
              />
            </div>
            <div>
              <label style={labelStyle}>מיקום</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="למשל: חוף הצוק"
              />
            </div>
            <div>
              <label style={labelStyle}>שעת התחלה</label>
              <input
                type="time"
                style={inputStyle}
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
              />
            </div>
            <div>
              <label style={labelStyle}>שעת סיום</label>
              <input
                type="time"
                style={inputStyle}
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div style={sectionBoxStyle}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
            🗓️ שיוך לעונה וסדרה
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>
                עונה <span style={{ color: colors.danger }}>*</span>
              </label>
              <select
                style={inputStyle}
                value={formData.season_id}
                onChange={(e) => handleSeasonSelect(e.target.value)}
              >
                <option value="">בחר עונה...</option>
                {seasonsOptions.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} · {season.year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                סדרת פעילויות <span style={{ color: colors.danger }}>*</span>
              </label>
              <select
                style={inputStyle}
                value={formData.series_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    series_id: e.target.value,
                  }))
                }
                disabled={
                  !formData.season_id ||
                  seriesOptionsLoading ||
                  seriesOptions.length === 0
                }
              >
                <option value="">
                  {!formData.season_id
                    ? "בחר עונה קודם"
                    : seriesOptionsLoading
                    ? "טוען סדרות..."
                    : "בחר סדרה"}
                </option>
                {seriesOptions.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.name}
                    {series.is_default ? " · ברירת מחדל" : ""}
                  </option>
                ))}
              </select>
              {formData.season_id &&
                !seriesOptionsLoading &&
                seriesOptions.length === 0 && (
                  <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>
                    אין סדרות לעונה זו. צור סדרה חדשה בעמוד העונות.
                  </div>
                )}
            </div>
            <div>
              <label style={labelStyle}>מזהה קבוצה (אופציונלי)</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.group_id}
                onChange={(e) =>
                  setFormData({ ...formData, group_id: e.target.value })
                }
                placeholder="GUID"
              />
            </div>
            <div>
              <label style={labelStyle}>קיבולת משתתפים</label>
              <input
                type="number"
                style={inputStyle}
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                placeholder="20"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={sectionBoxStyle}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
            📝 הערות
          </h4>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="הערות נוספות..."
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: spacing.md,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            type="button"
          >
            ביטול
          </Button>
          <Button onClick={handleSubmit} type="button">
            {editingActivity ? "עדכן" : "הוסף"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={showViewModal && !!viewingActivity}
        onClose={closeViewModal}
        width="min(640px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingActivity && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing.lg,
                gap: spacing.md,
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                פרטי פעילות –{" "}
                {viewingActivity.series_name || `סדרה #${viewingActivity.series_id}`}
              </h3>
              <Button variant="secondary" onClick={closeViewModal} type="button">
                ✕ סגור
              </Button>
            </div>

            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  color: muted,
                  borderBottom: `2px solid ${colors.borderMuted}`,
                  paddingBottom: spacing.sm,
                }}
              >
                📋 פרטי פעילות
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 24px",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סוג פעילות</div>
                  <div style={{ fontWeight: 600 }}>{viewingActivity.kind}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
                  <span
                    style={{
                      marginTop: spacing.xs,
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: radii.button,
                      fontSize: 12,
                      fontWeight: 600,
                      ...getStatusStyle(viewingActivity.status),
                    }}
                  >
                    {viewingActivity.status}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>מיקום</div>
                  <div>{viewingActivity.location || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>קיבולת</div>
                  <div>{viewingActivity.capacity ?? "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>קבוצה</div>
                  <div>{viewingActivity.group_name || viewingActivity.group_id || "—"}</div>
                </div>
              </div>
            </div>

            <div style={{ ...sectionBoxStyle, background: colors.surface }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  color: muted,
                  borderBottom: `2px solid ${colors.borderMuted}`,
                  paddingBottom: spacing.sm,
                }}
              >
                🗓️ לוח זמנים ושיוך
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 24px",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>תאריך</div>
                  <div>{formatDate(viewingActivity.activity_date)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>שעות</div>
                  <div>
                    {formatTimeRange(
                      viewingActivity.start_time,
                      viewingActivity.end_time
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>עונה</div>
                  <div>{viewingActivity.season_name || viewingActivity.season_id}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סדרה</div>
                  <div>
                    {viewingActivity.series_name ||
                      (viewingActivity.series_id
                        ? `סדרה #${viewingActivity.series_id}`
                        : "—")}
                  </div>
                </div>
              </div>
            </div>

            {viewingActivity.notes && (
              <div style={{ ...sectionBoxStyle, background: colors.surface }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    color: muted,
                    borderBottom: `2px solid ${colors.borderMuted}`,
                    paddingBottom: spacing.sm,
                  }}
                >
                  📝 הערות
                </h4>
                <div style={{ whiteSpace: "pre-wrap" }}>{viewingActivity.notes}</div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
