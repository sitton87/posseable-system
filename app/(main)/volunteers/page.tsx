"use client";

import { useState, useEffect } from "react";
import {
  Volunteer,
  SEA_CONNECTION_LEVEL_OPTIONS,
  VOLUNTEER_TYPE_OPTIONS,
  MEDIA_SPECIALIZATION_OPTIONS,
} from "@/type";

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

const LEGACY_KIND_LABELS: Record<string, string> = {
  Water: "מים",
  water: "מים",
  Media: "מדיה",
  media: "מדיה",
  Other: "אחר",
  other: "אחר",
};

const normalizeKind = (value?: string | null) => {
  if (!value) return null;
  return LEGACY_KIND_LABELS[value] || value;
};

const getVolunteerKindLabel = (volunteer: Volunteer) =>
  normalizeKind(volunteer.volunteer_type) ||
  normalizeKind(volunteer.kind) ||
  null;

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingVolunteer, setViewingVolunteer] = useState<Volunteer | null>(
    null
  );
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(
    null
  );

  // Filter states
  const [filterKind, setFilterKind] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [filterDateMode, setFilterDateMode] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Dynamic kind options from actual volunteers data
  const [availableKinds, setAvailableKinds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    national_id: "",
    full_name: "",
    phone: "",
    email: "",
    kind: "",
    street: "",
    house_number: "",
    city: "",
    join_date: "",
    training_date: "",
    profession: "",
    sea_connection_level: "",
    active: true,
    notes: "",
    volunteer_type: "",
    media_specialization: "",
    availability: "",
    personal_website: "",
    documents: "",
  });

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      // Fetch all volunteers (not just active ones)
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

  // Build dynamic list of available kinds from volunteers
  useEffect(() => {
    const kinds = volunteers
      .map((v) => getVolunteerKindLabel(v))
      .filter((k): k is string => !!k)
      .filter((k, i, arr) => arr.indexOf(k) === i)
      .sort();
    setAvailableKinds(kinds);
  }, [volunteers]);

  // Apply filters whenever volunteers or filter values change
  useEffect(() => {
    let filtered = [...volunteers];

    // Filter by kind (volunteer type)
    if (filterKind) {
      filtered = filtered.filter(
        (v) => getVolunteerKindLabel(v) === filterKind
      );
    }

    // Filter by active status
    if (filterActive === "active") {
      filtered = filtered.filter((v) => v.active === true);
    } else if (filterActive === "inactive") {
      filtered = filtered.filter((v) => v.active === false);
    }

    // Filter by join date
    if (filterDateMode && filterDate) {
      filtered = filtered.filter((v) => {
        if (!v.join_date) return false;
        const joinDate = new Date(v.join_date);
        const compareDate = new Date(filterDate);

        if (filterDateMode === "equal") {
          return joinDate.toDateString() === compareDate.toDateString();
        } else if (filterDateMode === "greater") {
          return joinDate > compareDate;
        } else if (filterDateMode === "less") {
          return joinDate < compareDate;
        }
        return true;
      });
    }

    setFilteredVolunteers(filtered);
  }, [volunteers, filterKind, filterActive, filterDateMode, filterDate]);

  const clearFilters = () => {
    setFilterKind("");
    setFilterActive("all");
    setFilterDateMode("");
    setFilterDate("");
  };

  const handleAdd = () => {
    setEditingVolunteer(null);
    setFormData({
      national_id: "",
      full_name: "",
      phone: "",
      email: "",
      kind: "",
      street: "",
      house_number: "",
      city: "",
      join_date: "",
      training_date: "",
      profession: "",
      sea_connection_level: "",
      active: true,
      notes: "",
      volunteer_type: "",
      media_specialization: "",
      availability: "",
      personal_website: "",
      documents: "",
    });
    setShowModal(true);
  };

  const handleView = (volunteer: Volunteer) => {
    setViewingVolunteer(volunteer);
    setShowViewModal(true);
  };

  const handleEdit = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setFormData({
      national_id: volunteer.national_id,
      full_name: volunteer.full_name,
      phone: volunteer.phone || "",
      email: volunteer.email || "",
      kind: volunteer.kind || "",
      street: volunteer.street || "",
      house_number: volunteer.house_number || "",
      city: volunteer.city || "",
      join_date: volunteer.join_date || "",
      training_date: volunteer.training_date || "",
      profession: volunteer.profession || "",
      sea_connection_level: volunteer.sea_connection_level?.toString() || "",
      active: volunteer.active,
      notes: volunteer.notes || "",
      volunteer_type: volunteer.volunteer_type || "",
      media_specialization: volunteer.media_specialization || "",
      availability: volunteer.availability || "",
      personal_website: volunteer.personal_website || "",
      documents: volunteer.documents || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.national_id.trim()) {
      alert("תעודת זהות היא שדה חובה");
      return;
    }

    if (!/^\d{9}$/.test(formData.national_id)) {
      alert("תעודת זהות חייבת להכיל בדיוק 9 ספרות");
      return;
    }

    if (!formData.full_name.trim()) {
      alert("שם מלא הוא שדה חובה");
      return;
    }

    try {
      const url = editingVolunteer
        ? "/api/volunteers/update"
        : "/api/volunteers/add";
      const method = editingVolunteer ? "PUT" : "POST";

      const body: any = {
        national_id: formData.national_id,
        full_name: formData.full_name,
        phone: formData.phone || null,
        email: formData.email || null,
        kind: formData.kind || null,
        street: formData.street || null,
        house_number: formData.house_number || null,
        city: formData.city || null,
        join_date: formData.join_date || null,
        training_date: formData.training_date || null,
        profession: formData.profession || null,
        sea_connection_level: formData.sea_connection_level
          ? parseInt(formData.sea_connection_level)
          : null,
        active: formData.active,
        notes: formData.notes || null,
        volunteer_type: formData.volunteer_type || null,
        media_specialization: formData.media_specialization || null,
        availability: formData.availability || null,
        personal_website: formData.personal_website || null,
        documents: formData.documents || null,
      };

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

  const handleDelete = async (national_id: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את המתנדב?")) return;

    try {
      const res = await fetch(
        `/api/volunteers/update?national_id=${national_id}`,
        {
          method: "DELETE",
        }
      );
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
              🤝 ניהול מתנדבים
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              מציג {filteredVolunteers.length} מתוך {volunteers.length} מתנדבים
            </div>
          </div>
          <button style={btnPrimary} onClick={handleAdd}>
            + הוסף מתנדב
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
            🔍 סינון מתנדבים
          </h3>
          <button
            style={{
              ...btnSecondary,
              fontSize: 12,
              padding: "6px 10px",
            }}
            onClick={clearFilters}
          >
            נקה סינונים
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 12,
          }}
        >
          {/* Filter by kind */}
          <div>
            <label style={labelStyle}>סוג מתנדב</label>
            <select
              style={inputStyle}
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value)}
            >
              <option value="">הכל</option>
              {availableKinds.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by active status */}
          <div>
            <label style={labelStyle}>סטטוס</label>
            <select
              style={inputStyle}
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <option value="all">הכל</option>
              <option value="active">פעיל</option>
              <option value="inactive">לא פעיל</option>
            </select>
          </div>

          {/* Filter by join date - mode */}
          <div>
            <label style={labelStyle}>תאריך הצטרפות</label>
            <select
              style={inputStyle}
              value={filterDateMode}
              onChange={(e) => setFilterDateMode(e.target.value)}
            >
              <option value="">ללא סינון</option>
              <option value="equal">שווה ל</option>
              <option value="greater">גדול מ</option>
              <option value="less">קטן מ</option>
            </select>
          </div>

          {/* Filter by join date - date picker */}
          <div>
            <label style={labelStyle}>תאריך</label>
            <input
              type="date"
              style={inputStyle}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              disabled={!filterDateMode}
            />
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
                <th style={{ textAlign: "right", padding: 8 }}>ת.ז.</th>
                <th style={{ textAlign: "right", padding: 8 }}>שם</th>
                <th style={{ textAlign: "center", padding: 8 }}>סוג</th>
                <th style={{ textAlign: "center", padding: 8 }}>עיר</th>
                <th style={{ textAlign: "center", padding: 8 }}>טלפון</th>
                <th style={{ textAlign: "center", padding: 8 }}>
                  תאריך הצטרפות
                </th>
                <th style={{ textAlign: "center", padding: 8 }}>פעילויות</th>
                <th style={{ textAlign: "center", padding: 8 }}>קשר לים</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((v) => (
                <tr
                  key={v.national_id}
                  style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
                >
                  <td
                    style={{
                      padding: 8,
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: muted,
                    }}
                  >
                    {v.national_id}
                  </td>
                  <td style={{ padding: 8, fontWeight: 600 }}>{v.full_name}</td>
                  <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                    {getVolunteerKindLabel(v) || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                    {v.city || "—"}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: 8,
                      color: muted,
                      fontSize: 13,
                    }}
                  >
                    {v.phone || "—"}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: 8,
                      color: muted,
                      fontSize: 13,
                    }}
                  >
                    {v.join_date
                      ? new Date(v.join_date).toLocaleDateString("he-IL")
                      : "—"}
                  </td>
                  <td
                    style={{ textAlign: "center", padding: 8, fontWeight: 600 }}
                  >
                    {v.total_activities || 0}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    {v.sea_connection_level !== null &&
                    v.sea_connection_level !== undefined
                      ? SEA_CONNECTION_LEVEL_OPTIONS[v.sea_connection_level]
                          ?.label || "—"
                      : "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <button
                      style={{ ...btnSecondary, marginLeft: 4, fontSize: 12 }}
                      onClick={() => handleView(v)}
                      title="צפייה"
                    >
                      👁️
                    </button>
                    <button
                      style={{ ...btnSecondary, marginLeft: 4, fontSize: 12 }}
                      onClick={() => handleEdit(v)}
                      title="עריכה"
                    >
                      ✏️
                    </button>
                    <button
                      style={{
                        ...btnSecondary,
                        color: "#dc2626",
                        fontSize: 12,
                      }}
                      onClick={() => handleDelete(v.national_id)}
                      title="מחיקה"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVolunteers.length === 0 && volunteers.length > 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    לא נמצאו מתנדבים התואמים לקריטריוני החיפוש.
                  </td>
                </tr>
              )}
              {volunteers.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין מתנדבים במערכת. לחץ על "הוסף מתנדב" להתחיל.
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
              width: "min(900px, 95vw)",
              padding: 24,
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800 }}>
              {editingVolunteer ? "ערוך מתנדב" : "הוסף מתנדב חדש"}
            </h3>

            {/* פרטים אישיים */}
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
                📋 פרטים אישיים
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
                    תעודת זהות <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.national_id}
                    onChange={(e) =>
                      setFormData({ ...formData, national_id: e.target.value })
                    }
                    disabled={!!editingVolunteer}
                    placeholder="9 ספרות"
                    maxLength={9}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    שם מלא <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>טלפון</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
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
                  />
                </div>
                <div>
                  <label style={labelStyle}>מקצוע</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.profession}
                    onChange={(e) =>
                      setFormData({ ...formData, profession: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* כתובת */}
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
                📍 כתובת
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>רחוב</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>מספר בית</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.house_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        house_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>עיר</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* פרטי התנדבות */}
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
                🏄 פרטי התנדבות
              </h4>

              {/* סוג מתנדב */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>סוג מתנדב</label>
                <select
                  style={inputStyle}
                  value={formData.volunteer_type}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      volunteer_type: e.target.value,
                      kind: e.target.value,
                    });
                  }}
                >
                  <option value="">בחר...</option>
                  {VOLUNTEER_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* תאריכים ורמת קשר */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>תאריך הצטרפות</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.join_date}
                    onChange={(e) =>
                      setFormData({ ...formData, join_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>תאריך הדרכה</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.training_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        training_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>רמת קשר לים</label>
                  <select
                    style={inputStyle}
                    value={formData.sea_connection_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sea_connection_level: e.target.value,
                      })
                    }
                  >
                    <option value="">בחר...</option>
                    {SEA_CONNECTION_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* שדות נוספים לפי סוג מתנדב */}
              <div
                style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}
              >
                {/* שדות למתנדבי מדיה */}
                {formData.volunteer_type === "מדיה" && (
                  <>
                    <div>
                      <label style={labelStyle}>התמחות</label>
                      <select
                        style={inputStyle}
                        value={formData.media_specialization}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            media_specialization: e.target.value,
                          })
                        }
                      >
                        <option value="">בחר...</option>
                        {MEDIA_SPECIALIZATION_OPTIONS.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>זמינות</label>
                      <textarea
                        style={{
                          ...inputStyle,
                          minHeight: 60,
                          resize: "vertical",
                        }}
                        value={formData.availability}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            availability: e.target.value,
                          })
                        }
                        placeholder="למשל: ימי שני-רביעי, 09:00-17:00"
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>אתר אישי / פורטפוליו</label>
                      <input
                        type="url"
                        style={inputStyle}
                        value={formData.personal_website}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            personal_website: e.target.value,
                          })
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </>
                )}

                {/* מסמכים - לכל סוגי המתנדבים */}
                <div>
                  <label style={labelStyle}>מסמכים (JSON)</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                    value={formData.documents}
                    onChange={(e) =>
                      setFormData({ ...formData, documents: e.target.value })
                    }
                    placeholder='[{"name": "אישור רפואי", "url": "...", "uploadDate": "2024-01-01"}]'
                  />
                  <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>
                    פורמט JSON של מסמכים
                  </div>
                </div>
              </div>
            </div>

            {/* הערות */}
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
                📝 הערות
              </h4>
              <div>
                <label style={labelStyle}>הערות כלליות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="הערות נוספות..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button style={btnSecondary} onClick={() => setShowModal(false)}>
                ביטול
              </button>
              <button style={btnPrimary} onClick={handleSubmit}>
                {editingVolunteer ? "עדכן" : "הוסף"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* מודל צפייה */}
      {showViewModal && viewingVolunteer && (
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
          onClick={() => setShowViewModal(false)}
        >
          <div
            style={{
              ...cardStyle,
              width: "min(900px, 95vw)",
              padding: 24,
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                פרטי מתנדב - {viewingVolunteer.full_name}
              </h3>
              <button
                style={btnSecondary}
                onClick={() => setShowViewModal(false)}
              >
                ✕ סגור
              </button>
            </div>

            {/* פרטים אישיים */}
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  color: muted,
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: 8,
                }}
              >
                📋 פרטים אישיים
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 24px",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>תעודת זהות</div>
                  <div style={{ fontWeight: 600, fontFamily: "monospace" }}>
                    {viewingVolunteer.national_id}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>שם מלא</div>
                  <div style={{ fontWeight: 600 }}>
                    {viewingVolunteer.full_name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>טלפון</div>
                  <div>{viewingVolunteer.phone || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>אימייל</div>
                  <div>{viewingVolunteer.email || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סוג</div>
                  <div>{viewingVolunteer.kind || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>מקצוע</div>
                  <div>{viewingVolunteer.profession || "—"}</div>
                </div>
              </div>
            </div>

            {/* כתובת */}
            {(viewingVolunteer.street ||
              viewingVolunteer.house_number ||
              viewingVolunteer.city) && (
              <div style={{ marginBottom: 20 }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    color: muted,
                    borderBottom: "2px solid #e5e7eb",
                    paddingBottom: 8,
                  }}
                >
                  📍 כתובת
                </h4>
                <div>
                  {viewingVolunteer.street} {viewingVolunteer.house_number},{" "}
                  {viewingVolunteer.city}
                </div>
              </div>
            )}

            {/* סוג מתנדב ופרטים ספציפיים */}
            {viewingVolunteer.volunteer_type && (
              <div style={{ marginBottom: 20 }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    color: muted,
                    borderBottom: "2px solid #e5e7eb",
                    paddingBottom: 8,
                  }}
                >
                  🏊 סוג מתנדב
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px 24px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: muted }}>סוג</div>
                    <div style={{ fontWeight: 600 }}>
                      {viewingVolunteer.volunteer_type}
                    </div>
                  </div>

                  {viewingVolunteer.volunteer_type === "מדיה" && (
                    <>
                      {viewingVolunteer.media_specialization && (
                        <div>
                          <div style={{ fontSize: 12, color: muted }}>
                            התמחות
                          </div>
                          <div>{viewingVolunteer.media_specialization}</div>
                        </div>
                      )}
                      {viewingVolunteer.availability && (
                        <div style={{ gridColumn: "1 / -1" }}>
                          <div style={{ fontSize: 12, color: muted }}>
                            זמינות
                          </div>
                          <div style={{ whiteSpace: "pre-wrap" }}>
                            {viewingVolunteer.availability}
                          </div>
                        </div>
                      )}
                      {viewingVolunteer.personal_website && (
                        <div>
                          <div style={{ fontSize: 12, color: muted }}>
                            אתר אישי
                          </div>
                          <a
                            href={viewingVolunteer.personal_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0ea5e9" }}
                          >
                            {viewingVolunteer.personal_website}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* פרטי התנדבות */}
            <div style={{ marginBottom: 20 }}>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 14,
                  color: muted,
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: 8,
                }}
              >
                🏄 פרטי התנדבות
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 24px",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>
                    תאריך הצטרפות
                  </div>
                  <div>
                    {viewingVolunteer.join_date
                      ? new Date(viewingVolunteer.join_date).toLocaleDateString(
                          "he-IL"
                        )
                      : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>תאריך הדרכה</div>
                  <div>
                    {viewingVolunteer.training_date
                      ? new Date(
                          viewingVolunteer.training_date
                        ).toLocaleDateString("he-IL")
                      : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>
                    סה"כ פעילויות
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>
                    {viewingVolunteer.total_activities || 0}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>רמת קשר לים</div>
                  <div>
                    {viewingVolunteer.sea_connection_level !== null &&
                    viewingVolunteer.sea_connection_level !== undefined
                      ? SEA_CONNECTION_LEVEL_OPTIONS[
                          viewingVolunteer.sea_connection_level
                        ]?.label || "—"
                      : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background: viewingVolunteer.active
                          ? "#d1fae5"
                          : "#fee2e2",
                        color: viewingVolunteer.active ? "#065f46" : "#991b1b",
                      }}
                    >
                      {viewingVolunteer.active ? "פעיל" : "לא פעיל"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* מסמכים */}
            {viewingVolunteer.documents && (
              <div style={{ marginBottom: 20 }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    color: muted,
                    borderBottom: "2px solid #e5e7eb",
                    paddingBottom: 8,
                  }}
                >
                  📄 מסמכים
                </h4>
                <div style={{ fontSize: 13, fontFamily: "monospace" }}>
                  {viewingVolunteer.documents}
                </div>
              </div>
            )}

            {/* הערות */}
            {viewingVolunteer.notes && (
              <div style={{ marginBottom: 20 }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    color: muted,
                    borderBottom: "2px solid #e5e7eb",
                    paddingBottom: 8,
                  }}
                >
                  📝 הערות
                </h4>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {viewingVolunteer.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
