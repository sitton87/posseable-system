"use client";

import { useState, useEffect } from "react";
import { Activity, PROGRAM_OPTIONS } from "@/type";

// Styles
const muted = "#6b7280";
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 6px 18px rgba(12,18,31,0.06)",
  border: "1px solid rgba(15,23,42,0.06)",
};

const btn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
  color: "#fff",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
};

const btnSecondary: React.CSSProperties = {
  ...btn,
  background: "#f3f4f6",
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: muted,
  marginBottom: 4,
  display: "block",
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
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [filterKind, setFilterKind] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState({
    season_id: "",
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
    fetchActivities();
  }, [filterKind, filterStatus]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let url = "/api/activities";
      const params = new URLSearchParams();
      if (filterKind) params.append("kind", filterKind);
      if (filterStatus) params.append("status", filterStatus);
      if (params.toString()) url += `?${params}`;

      const res = await fetch(url);
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

  const handleAdd = () => {
    setEditingActivity(null);
    setFormData({
      season_id: "",
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
    setShowModal(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      season_id: activity.season_id.toString(),
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
  };

  const handleSubmit = async () => {
    if (!formData.season_id || !formData.activity_date) {
      alert("עונה ותאריך הם שדות חובה");
      return;
    }

    try {
      const url = editingActivity
        ? "/api/activities/update"
        : "/api/activities/add";
      const method = editingActivity ? "PUT" : "POST";

      const body: any = {
        season_id: parseInt(formData.season_id),
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
      <div style={{ padding: 20, textAlign: "center" }}>
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
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
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
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף פעילות
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <select
              style={inputStyle}
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
          <div style={{ flex: 1 }}>
            <select
              style={inputStyle}
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
      </div>

      {/* Table */}
      <div style={cardStyle}>
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
                <th style={{ textAlign: "right", padding: 8 }}>סוג</th>
                <th style={{ textAlign: "right", padding: 8 }}>תאריך</th>
                <th style={{ textAlign: "center", padding: 8 }}>שעה</th>
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
                    {a.start_time && a.end_time
                      ? `${a.start_time}-${a.end_time}`
                      : a.start_time || "—"}
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
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          a.status === "הושלם"
                            ? "rgba(34, 197, 94, 0.1)"
                            : a.status === "פעיל"
                            ? "rgba(59, 130, 246, 0.1)"
                            : a.status === "מתוכנן"
                            ? "rgba(251, 191, 36, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        color:
                          a.status === "הושלם"
                            ? "#16a34a"
                            : a.status === "פעיל"
                            ? "#2563eb"
                            : a.status === "מתוכנן"
                            ? "#d97706"
                            : "#dc2626",
                      }}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <button
                      style={{ ...btnSecondary, marginLeft: 4, fontSize: 12 }}
                      onClick={() => handleEdit(a)}
                    >
                      ✏️
                    </button>
                    <button
                      style={{
                        ...btnSecondary,
                        color: "#dc2626",
                        fontSize: 12,
                      }}
                      onClick={() => handleDelete(a.id)}
                    >
                      🗑️
                    </button>
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
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            overflow: "auto",
            padding: "20px 0",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(700px, 95vw)",
              padding: 24,
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800 }}>
              {editingActivity ? "ערוך פעילות" : "הוסף פעילות חדשה"}
            </h3>

            {/* Basic Info */}
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
                📋 פרטים בסיסיים
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    סוג פעילות <span style={{ color: "#ef4444" }}>*</span>
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
                    סטטוס <span style={{ color: "#ef4444" }}>*</span>
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
                    תאריך <span style={{ color: "#ef4444" }}>*</span>
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
                <div>
                  <label style={labelStyle}>
                    מזהה עונה <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={formData.season_id}
                    onChange={(e) =>
                      setFormData({ ...formData, season_id: e.target.value })
                    }
                    placeholder="1"
                  />
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
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>הערות</label>
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
                gap: 12,
                justifyContent: "flex-end",
              }}
            >
              <button style={btnSecondary} onClick={() => setShowModal(false)}>
                ביטול
              </button>
              <button style={btnPrimary} onClick={handleSubmit}>
                {editingActivity ? "עדכן" : "הוסף"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

