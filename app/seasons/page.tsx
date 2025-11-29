"use client";

import { useState, useEffect } from "react";
import { SeasonPlan } from "@/type";

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

export default function SeasonsPage() {
  const [seasons, setSeasons] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeason, setEditingSeason] = useState<SeasonPlan | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    year: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seasons");
      const data = await res.json();
      if (data.success) {
        setSeasons(data.seasons);
      }
    } catch (err) {
      console.error("Error fetching seasons:", err);
      alert("שגיאה בטעינת עונות");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSeason(null);
    setFormData({
      name: "",
      year: new Date().getFullYear().toString(),
      start_date: "",
      end_date: "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (season: SeasonPlan) => {
    setEditingSeason(season);
    setFormData({
      name: season.name,
      year: season.year.toString(),
      start_date: season.start_date.toString().split("T")[0],
      end_date: season.end_date.toString().split("T")[0],
      notes: season.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.year || !formData.start_date || !formData.end_date) {
      alert("שם, שנה, תאריך התחלה וסיום הם שדות חובה");
      return;
    }

    try {
      const url = editingSeason ? "/api/seasons/update" : "/api/seasons/add";
      const method = editingSeason ? "PUT" : "POST";

      const body: any = {
        name: formData.name,
        year: parseInt(formData.year),
        start_date: formData.start_date,
        end_date: formData.end_date,
        notes: formData.notes || null,
      };

      if (editingSeason) {
        body.id = editingSeason.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingSeason ? "עונה עודכנה בהצלחה!" : "עונה נוספה בהצלחה!");
        setShowModal(false);
        fetchSeasons();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving season:", err);
      alert("שגיאה בשמירת עונה");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את העונה?")) return;

    try {
      const res = await fetch(`/api/seasons/update?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("עונה נמחקה בהצלחה!");
        fetchSeasons();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting season:", err);
      alert("שגיאה במחיקת עונה");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען עונות...</div>
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
              🗓️ ניהול עונות
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {seasons.length} עונות במערכת
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף עונה
          </button>
        </div>
      </div>

      {/* Seasons Table */}
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
                <th style={{ textAlign: "right", padding: 8 }}>שם העונה</th>
                <th style={{ textAlign: "center", padding: 8 }}>שנה</th>
                <th style={{ textAlign: "center", padding: 8 }}>תאריך התחלה</th>
                <th style={{ textAlign: "center", padding: 8 }}>תאריך סיום</th>
                <th style={{ textAlign: "center", padding: 8 }}>משך (ימים)</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => {
                const start = new Date(s.start_date);
                const end = new Date(s.end_date);
                const duration = Math.ceil(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <tr
                    key={s.id}
                    style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
                  >
                    <td style={{ padding: 8, fontWeight: 600 }}>{s.name}</td>
                    <td style={{ textAlign: "center", padding: 8, color: muted }}>
                      {s.year}
                    </td>
                    <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                      {start.toLocaleDateString("he-IL")}
                    </td>
                    <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                      {end.toLocaleDateString("he-IL")}
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: "rgba(59, 130, 246, 0.1)",
                          color: "#2563eb",
                        }}
                      >
                        {duration} ימים
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      <button
                        style={{ ...btnSecondary, marginLeft: 4, fontSize: 12 }}
                        onClick={() => handleEdit(s)}
                      >
                        ✏️
                      </button>
                      <button
                        style={{
                          ...btnSecondary,
                          color: "#dc2626",
                          fontSize: 12,
                        }}
                        onClick={() => handleDelete(s.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
              {seasons.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין עונות במערכת. לחץ על "הוסף עונה" להתחיל.
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
              {editingSeason ? "ערוך עונה" : "הוסף עונה חדשה"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  שם העונה <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="למשל: קיץ 2024"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  שנה <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  style={inputStyle}
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  placeholder="2024"
                  min="2000"
                  max="2100"
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
                  <label style={labelStyle}>
                    תאריך התחלה <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    תאריך סיום <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
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
                  {editingSeason ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

