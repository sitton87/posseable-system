"use client";

import { useState, useEffect } from "react";
import { Donor } from "@/type";

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
  fontSize: 12,
  padding: "6px 10px",
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

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [viewingDonor, setViewingDonor] = useState<Donor | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    national_id: "",
    full_name: "",
    organization: "",
    phone: "",
    email: "",
    notes: "",
    is_active: true,
  });

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/donors", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setDonors(data.donors);
      }
    } catch (err) {
      console.error("Error fetching donors:", err);
      alert("שגיאה בטעינת תורמים");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDonor(null);
    setFormData({
      national_id: "",
      full_name: "",
      organization: "",
      phone: "",
      email: "",
      notes: "",
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (donor: Donor) => {
    setEditingDonor(donor);
    setFormData({
      national_id: donor.national_id,
      full_name: donor.full_name,
      organization: donor.organization || "",
      phone: donor.phone || "",
      email: donor.email || "",
      notes: donor.notes || "",
      is_active: donor.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!/^\d{9}$/.test(formData.national_id)) {
      alert("תעודת זהות חייבת להכיל 9 ספרות");
      return;
    }

    if (!formData.full_name.trim()) {
      alert("שם התורם הוא שדה חובה");
      return;
    }

    try {
      const url = editingDonor ? "/api/donors/update" : "/api/donors/add";
      const method = editingDonor ? "PUT" : "POST";

      const body: any = {
        national_id: formData.national_id,
        full_name: formData.full_name,
        organization: formData.organization || null,
        phone: formData.phone || null,
        email: formData.email || null,
        notes: formData.notes || null,
        is_active: formData.is_active,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingDonor ? "תורם עודכן בהצלחה!" : "תורם נוסף בהצלחה!");
        setShowModal(false);
        fetchDonors();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving donor:", err);
      alert("שגיאה בשמירת תורם");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את התורם?")) return;

    try {
      const res = await fetch(
        `/api/donors/update?national_id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (data.success) {
        alert("תורם בוטל בהצלחה!");
        fetchDonors();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting donor:", err);
      alert("שגיאה במחיקת תורם");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען תורמים...</div>
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
              ❤️ ניהול תורמים
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {donors.length} תורמים במערכת
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף תורם
          </button>
        </div>
      </div>

      {/* Donors Table */}
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
                <th style={{ textAlign: "right", padding: 8 }}>ת.ז</th>
                <th style={{ textAlign: "right", padding: 8 }}>שם</th>
              <th style={{ textAlign: "center", padding: 8 }}>ארגון</th>
              <th style={{ textAlign: "center", padding: 8 }}>טלפון</th>
              <th style={{ textAlign: "center", padding: 8 }}>אימייל</th>
              <th style={{ textAlign: "center", padding: 8 }}>סה״כ תרומות</th>
              <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
              <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((d) => (
              <tr
                key={d.id}
                style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
              >
                <td style={{ padding: 8, color: muted, fontFamily: "monospace" }}>
                  {d.national_id}
                </td>
                <td style={{ padding: 8, fontWeight: 600 }}>{d.full_name}</td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {d.organization || "—"}
                  </td>
                <td style={{ textAlign: "center", padding: 8, color: muted }}>
                  {d.phone || "—"}
                </td>
                <td style={{ textAlign: "center", padding: 8, color: muted }}>
                  {d.email || "—"}
                </td>
                <td
                  style={{
                    textAlign: "center",
                    padding: 8,
                    fontWeight: 600,
                  }}
                >
                  ₪{(d.total_donations || 0).toLocaleString()}
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: d.is_active
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                      color: d.is_active ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {d.is_active ? "פעיל" : "לא פעיל"}
                  </span>
                </td>
                <td style={{ textAlign: "center", padding: 8 }}>
                  <button
                    style={{ ...btnSecondary, marginLeft: 4 }}
                    onClick={() => handleEdit(d)}
                  >
                    ✏️ ערוך
                  </button>
                  <button
                    style={{ ...btnSecondary, marginLeft: 4 }}
                    onClick={() => {
                      setViewingDonor(d);
                      setShowViewModal(true);
                    }}
                  >
                    👁️ צפייה
                  </button>
                  <button
                    style={{
                      ...btnSecondary,
                      color: "#dc2626",
                    }}
                    onClick={() => handleDelete(d.national_id)}
                  >
                    🗑️ בטל
                  </button>
                </td>
              </tr>
            ))}
            {donors.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: 20, color: muted }}
                >
                  אין תורמים במערכת. לחץ על "הוסף תורם" להתחיל.
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
              {editingDonor ? "ערוך תורם" : "הוסף תורם חדש"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    תעודת זהות <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={9}
                    style={inputStyle}
                    value={formData.national_id}
                    onChange={(e) =>
                      setFormData({ ...formData, national_id: e.target.value })
                    }
                    placeholder="9 ספרות"
                    disabled={!!editingDonor}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    שם התורם <span style={{ color: "#ef4444" }}>*</span>
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
              </div>

              <div>
                <label style={labelStyle}>ארגון / חברה</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  placeholder="שם הארגון"
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
                  <label style={labelStyle}>טלפון</label>
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
                  <label style={labelStyle}>אימייל</label>
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
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
                <label
                  htmlFor="active"
                  style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  תורם פעיל
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
                  {editingDonor ? "עדכן" : "הוסף"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingDonor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowViewModal(false)}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(600px, 90vw)",
              padding: 24,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                פרטי תורם
              </h3>
              <button
                style={btnSecondary}
                onClick={() => setShowViewModal(false)}
              >
                ✕ סגור
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label style={labelStyle}>תעודת זהות</label>
                <div style={{ fontFamily: "monospace" }}>
                  {viewingDonor.national_id}
                </div>
              </div>
              <div>
                <label style={labelStyle}>שם מלא</label>
                <div style={{ fontWeight: 600 }}>{viewingDonor.full_name}</div>
              </div>
              <div>
                <label style={labelStyle}>ארגון</label>
                <div>{viewingDonor.organization || "—"}</div>
              </div>
              <div>
                <label style={labelStyle}>טלפון</label>
                <div>{viewingDonor.phone || "—"}</div>
              </div>
              <div>
                <label style={labelStyle}>אימייל</label>
                <div>{viewingDonor.email || "—"}</div>
              </div>
              <div>
                <label style={labelStyle}>סטטוס</label>
                <div>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: viewingDonor.is_active
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                      color: viewingDonor.is_active ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {viewingDonor.is_active ? "פעיל" : "לא פעיל"}
                  </span>
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>הערות</label>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {viewingDonor.notes || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

