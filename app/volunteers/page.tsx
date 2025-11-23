"use client";

import { useState, useEffect } from "react";

// Types
type Volunteer = {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  kind?: string;
  active: boolean;
  notes?: string;
  created_at: string;
};

type Role = {
  role_id: string;
  role_name: string;
  role_description?: string;
  assigned_at: string;
};

// Styles (matching your demo)
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

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(
    null
  );
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    kind: "",
    active: true,
    notes: "",
  });

  // Fetch volunteers
  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/volunteers");
      const data = await res.json();
      if (data.success) {
        setVolunteers(data.volunteers);
      }
    } catch (err) {
      console.error("Error fetching volunteers:", err);
      alert("שגיאה בטעינת מתנדבים");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingVolunteer(null);
    setFormData({
      full_name: "",
      phone: "",
      email: "",
      kind: "",
      active: true,
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setFormData({
      full_name: volunteer.full_name,
      phone: volunteer.phone || "",
      email: volunteer.email || "",
      kind: volunteer.kind || "",
      active: volunteer.active,
      notes: volunteer.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.full_name.trim()) {
      alert("שם מלא הוא שדה חובה");
      return;
    }

    try {
      const url = editingVolunteer
        ? "/api/volunteers/update"
        : "/api/volunteers/add";
      const method = editingVolunteer ? "PUT" : "POST";
      const body = editingVolunteer
        ? { id: editingVolunteer.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingVolunteer ? "מתנדב עודכן בהצלחה!" : "מתנדב נוסף בהצלחה!");
        setShowModal(false);
        fetchVolunteers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving volunteer:", err);
      alert("שגיאה בשמירת מתנדב");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את המתנדב?")) return;

    try {
      const res = await fetch(`/api/volunteers/update?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("מתנדב בוטל בהצלחה!");
        fetchVolunteers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting volunteer:", err);
      alert("שגיאה במחיקת מתנדב");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען מתנדבים...</div>
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
              🏃 ניהול מתנדבים
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {volunteers.length} מתנדבים במערכת
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף מתנדב
          </button>
        </div>
      </div>

      {/* Volunteers Table */}
      <div style={cardStyle}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 8px",
          }}
        >
          <thead style={{ borderBottom: "2px solid rgba(15,23,42,0.15)" }}>
            <tr style={{ color: muted, fontSize: 13 }}>
              <th style={{ textAlign: "right", padding: 8 }}>שם מלא</th>
              <th style={{ textAlign: "center", padding: 8 }}>טלפון</th>
              <th style={{ textAlign: "center", padding: 8 }}>אימייל</th>
              <th style={{ textAlign: "center", padding: 8 }}>סוג</th>
              <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
              <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((v) => (
              <tr
                key={v.id}
                style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
              >
                <td style={{ padding: 8, fontWeight: 600 }}>{v.full_name}</td>
                <td style={{ textAlign: "center", padding: 8, color: muted }}>
                  {v.phone || "—"}
                </td>
                <td style={{ textAlign: "center", padding: 8, color: muted }}>
                  {v.email || "—"}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  {v.kind || "—"}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: v.active
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                      color: v.active ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {v.active ? "פעיל" : "לא פעיל"}
                  </span>
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <button
                    style={{ ...btnSecondary, marginLeft: 4 }}
                    onClick={() => handleEdit(v)}
                  >
                    ✏️ ערוך
                  </button>
                  <button
                    style={{
                      ...btnSecondary,
                      color: "#dc2626",
                    }}
                    onClick={() => handleDelete(v.id)}
                  >
                    🗑️ בטל
                  </button>
                </td>
              </tr>
            ))}
            {volunteers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 20, color: muted }}
                >
                  אין מתנדבים במערכת. לחץ על "הוסף מתנדב" להתחיל.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
              {editingVolunteer ? "ערוך מתנדב" : "הוסף מתנדב חדש"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: muted }}>
                  שם מלא *
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="הזן שם מלא"
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
                  <label
                    style={{ fontSize: 13, fontWeight: 600, color: muted }}
                  >
                    טלפון
                  </label>
                  <input
                    type="tel"
                    style={inputStyle}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="050-1234567"
                  />
                </div>

                <div>
                  <label
                    style={{ fontSize: 13, fontWeight: 600, color: muted }}
                  >
                    אימייל
                  </label>
                  <input
                    type="email"
                    style={inputStyle}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: muted }}>
                  סוג מתנדב
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.kind}
                  onChange={(e) =>
                    setFormData({ ...formData, kind: e.target.value })
                  }
                  placeholder="למשל: מדריך, רפרנט, וכו׳"
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: muted }}>
                  הערות
                </label>
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
                  מתנדב פעיל
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
                  {editingVolunteer ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
