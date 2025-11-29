"use client";

import { useState, useEffect } from "react";
import { Group, GROUP_STATUS_OPTIONS } from "@/type";

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

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    season_id: "",
    min_participants: "",
    max_participants: "",
    status: "פעיל",
    is_active: true,
    notes: "",
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
      alert("שגיאה בטעינת קבוצות");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGroup(null);
    setFormData({
      name: "",
      description: "",
      season_id: "",
      min_participants: "",
      max_participants: "",
      status: "פעיל",
      is_active: true,
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      season_id: group.season_id.toString(),
      min_participants: group.min_participants.toString(),
      max_participants: group.max_participants.toString(),
      status: group.status,
      is_active: group.is_active,
      notes: group.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.season_id) {
      alert("שם הקבוצה ומזהה עונה הם שדות חובה");
      return;
    }

    try {
      const url = editingGroup ? "/api/groups/update" : "/api/groups/add";
      const method = editingGroup ? "PUT" : "POST";

      const body: any = {
        name: formData.name,
        description: formData.description || null,
        season_id: parseInt(formData.season_id),
        min_participants: parseInt(formData.min_participants) || 0,
        max_participants: parseInt(formData.max_participants) || 0,
        status: formData.status,
        is_active: formData.is_active,
        notes: formData.notes || null,
      };

      if (editingGroup) {
        body.id = editingGroup.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingGroup ? "קבוצה עודכנה בהצלחה!" : "קבוצה נוספה בהצלחה!");
        setShowModal(false);
        fetchGroups();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving group:", err);
      alert("שגיאה בשמירת קבוצה");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הקבוצה?")) return;

    try {
      const res = await fetch(`/api/groups/update?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("קבוצה נמחקה בהצלחה!");
        fetchGroups();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("שגיאה במחיקת קבוצה");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען קבוצות...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              👥 ניהול קבוצות
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {groups.length} קבוצות במערכת
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף קבוצה
          </button>
        </div>
      </div>

      {/* Groups Table */}
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
                <th style={{ textAlign: "right", padding: 8 }}>שם הקבוצה</th>
                <th style={{ textAlign: "center", padding: 8 }}>עונה</th>
                <th style={{ textAlign: "center", padding: 8 }}>משתתפים</th>
                <th style={{ textAlign: "center", padding: 8 }}>מינימום</th>
                <th style={{ textAlign: "center", padding: 8 }}>מקסימום</th>
                <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעיל</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.id}
                  style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
                >
                  <td style={{ padding: 8, fontWeight: 600 }}>{g.name}</td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {g.season_name || `עונה ${g.season_id}`}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span className="font-bold text-blue-600">
                      {g.current_participants}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {g.min_participants}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {g.max_participants}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          g.status === "פעיל"
                            ? "rgba(34, 197, 94, 0.1)"
                            : g.status === "מלא"
                            ? "rgba(59, 130, 246, 0.1)"
                            : g.status === "סגור"
                            ? "rgba(239, 68, 68, 0.1)"
                            : "rgba(251, 191, 36, 0.1)",
                        color:
                          g.status === "פעיל"
                            ? "#16a34a"
                            : g.status === "מלא"
                            ? "#2563eb"
                            : g.status === "סגור"
                            ? "#dc2626"
                            : "#d97706",
                      }}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    {g.is_active ? "✅" : "❌"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <button
                      style={{ ...btnSecondary, marginLeft: 4, fontSize: 12 }}
                      onClick={() => handleEdit(g)}
                    >
                      ✏️
                    </button>
                    <button
                      style={{
                        ...btnSecondary,
                        color: "#dc2626",
                        fontSize: 12,
                      }}
                      onClick={() => handleDelete(g.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין קבוצות במערכת. לחץ על "הוסף קבוצה" להתחיל.
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
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(700px, 90vw)",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
              {editingGroup ? "ערוך קבוצה" : "הוסף קבוצה חדשה"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  שם הקבוצה <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="למשל: קבוצת ילדים א׳"
                />
              </div>

              <div>
                <label style={labelStyle}>תיאור</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="תיאור הקבוצה..."
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
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
                  <label style={labelStyle}>מינימום משתתפים</label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={formData.min_participants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        min_participants: e.target.value,
                      })
                    }
                    placeholder="5"
                    min="0"
                  />
                </div>

                <div>
                  <label style={labelStyle}>מקסימום משתתפים</label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={formData.max_participants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_participants: e.target.value,
                      })
                    }
                    placeholder="20"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>סטטוס הקבוצה</label>
                <select
                  style={inputStyle}
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  {GROUP_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>הערות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="הערות נוספות..."
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
                <label
                  htmlFor="active"
                  style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  קבוצה פעילה
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  style={btnSecondary}
                  onClick={() => setShowModal(false)}
                >
                  ביטול
                </button>
                <button style={btnPrimary} onClick={handleSubmit}>
                  {editingGroup ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

