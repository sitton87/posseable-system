"use client";

import { useState, useEffect } from "react";
import { Equipment } from "@/type";

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

const EQUIPMENT_CATEGORIES = [
  "גלשן",
  "חליפת גלישה",
  "ווסט הצלה",
  "קסדה",
  "נעלי ים",
  "אחר",
] as const;

const EQUIPMENT_CONDITIONS = ["חדש", "טוב", "בינוני", "דורש תיקון", "לא תקין"] as const;

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null
  );
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterCondition, setFilterCondition] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    size: "",
    condition: "טוב",
    active: true,
    notes: "",
  });

  useEffect(() => {
    fetchEquipment();
  }, [filterCategory, filterCondition]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      let url = "/api/equipment?active=true";
      if (filterCategory) url += `&category=${filterCategory}`;
      if (filterCondition) url += `&condition=${filterCondition}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setEquipment(data.equipment);
      }
    } catch (err) {
      console.error("Error fetching equipment:", err);
      alert("שגיאה בטעינת ציוד");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEquipment(null);
    setFormData({
      name: "",
      category: "",
      size: "",
      condition: "טוב",
      active: true,
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData({
      name: eq.name,
      category: eq.category || "",
      size: eq.size || "",
      condition: eq.condition || "טוב",
      active: eq.active,
      notes: eq.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("שם הציוד הוא שדה חובה");
      return;
    }

    try {
      const url = editingEquipment
        ? "/api/equipment/update"
        : "/api/equipment/add";
      const method = editingEquipment ? "PUT" : "POST";

      const body: any = {
        name: formData.name,
        category: formData.category || null,
        size: formData.size || null,
        condition: formData.condition,
        active: formData.active,
        notes: formData.notes || null,
      };

      if (editingEquipment) {
        body.id = editingEquipment.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingEquipment ? "ציוד עודכן בהצלחה!" : "ציוד נוסף בהצלחה!");
        setShowModal(false);
        fetchEquipment();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving equipment:", err);
      alert("שגיאה בשמירת ציוד");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את הציוד?")) return;

    try {
      const res = await fetch(`/api/equipment/update?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("ציוד בוטל בהצלחה!");
        fetchEquipment();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting equipment:", err);
      alert("שגיאה במחיקת ציוד");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען ציוד...</div>
      </div>
    );
  }

  // Count by category
  const categoryCounts: Record<string, number> = {};
  equipment.forEach((e) => {
    if (e.category) {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    }
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
              🛠️ ניהול ציוד
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {equipment.length} פריטי ציוד במערכת
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף ציוד
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <select
              style={inputStyle}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">כל הקטגוריות</option>
              {EQUIPMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c} ({categoryCounts[c] || 0})
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <select
              style={inputStyle}
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
            >
              <option value="">כל המצבים</option>
              {EQUIPMENT_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
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
                <th style={{ textAlign: "right", padding: 8 }}>שם</th>
                <th style={{ textAlign: "center", padding: 8 }}>קטגוריה</th>
                <th style={{ textAlign: "center", padding: 8 }}>מידה</th>
                <th style={{ textAlign: "center", padding: 8 }}>מצב</th>
                <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => (
                <tr
                  key={eq.id}
                  style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
                >
                  <td style={{ padding: 8, fontWeight: 600 }}>{eq.name}</td>
                  <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                    {eq.category || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {eq.size || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          eq.condition === "חדש" || eq.condition === "טוב"
                            ? "rgba(34, 197, 94, 0.1)"
                            : eq.condition === "בינוני"
                            ? "rgba(251, 191, 36, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        color:
                          eq.condition === "חדש" || eq.condition === "טוב"
                            ? "#16a34a"
                            : eq.condition === "בינוני"
                            ? "#d97706"
                            : "#dc2626",
                      }}
                    >
                      {eq.condition || "—"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: eq.active
                          ? "rgba(34, 197, 94, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                        color: eq.active ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {eq.active ? "פעיל" : "לא פעיל"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <button
                      style={{ ...btnSecondary, marginLeft: 4, fontSize: 12 }}
                      onClick={() => handleEdit(eq)}
                    >
                      ✏️
                    </button>
                    <button
                      style={{
                        ...btnSecondary,
                        color: "#dc2626",
                        fontSize: 12,
                      }}
                      onClick={() => handleDelete(eq.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {equipment.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין ציוד במערכת. לחץ על "הוסף ציוד" להתחיל.
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
              width: "min(600px, 90vw)",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
              {editingEquipment ? "ערוך ציוד" : "הוסף ציוד חדש"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  שם הציוד <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="למשל: גלשן 8 רגל"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>קטגוריה</label>
                  <select
                    style={inputStyle}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">בחר קטגוריה...</option>
                    {EQUIPMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>מידה</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                    placeholder="למשל: L, 8', 42"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>מצב הציוד</label>
                <select
                  style={inputStyle}
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value })
                  }
                >
                  {EQUIPMENT_CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
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

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                />
                <label
                  htmlFor="active"
                  style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  ציוד פעיל
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
                  {editingEquipment ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

