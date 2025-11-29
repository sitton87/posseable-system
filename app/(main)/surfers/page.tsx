"use client";

import { useState, useEffect } from "react";
import {
  Surfer,
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  PROGRAM_OPTIONS,
} from "@/type";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import { Button, Card, Modal } from "@/app/components/ui";

const muted = colors.textMuted;

export default function SurferPage() {
  const [surfers, setSurfers] = useState<Surfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSurfer, setEditingSurfer] = useState<Surfer | null>(null);
  const [viewingSurfer, setViewingSurfer] = useState<Surfer | null>(null);
  const [filterProgram, setFilterProgram] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState({
    national_id: "",
    full_name: "",
    phone: "",
    email: "",
    residence: "",
    age: "",
    date_of_birth: "",
    gender: "",
    status: "בהמתנה",
    program: "",
    group_id: "", // Add group_id here
    medical_approval: false,
    medical_condition: "",
    needs_wheelchair: false,
    volunteers_needed: "",
    special_requirements: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    active: true,
    notes: "",
  });

  useEffect(() => {
    fetchSurfers();
  }, [filterProgram, filterStatus]);

  const fetchSurfers = async () => {
    try {
      setLoading(true);
      let url = "/api/surfer?active=true";
      if (filterProgram) url += `&program=${filterProgram}`;
      if (filterStatus) url += `&status=${filterStatus}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSurfers(data.surfers);
      }
    } catch (err) {
      console.error("Error fetching surfers:", err);
      alert("שגיאה בטעינת גולשים");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSurfer(null);
    setFormData({
      national_id: "",
      full_name: "",
      phone: "",
      email: "",
      residence: "",
      age: "",
      date_of_birth: "",
      gender: "",
      status: "בהמתנה",
      program: "",
      group_id: "", // Add group_id here
      medical_approval: false,
      medical_condition: "",
      needs_wheelchair: false,
      volunteers_needed: "",
      special_requirements: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      active: true,
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (surfer: Surfer) => {
    setEditingSurfer(surfer);
    setFormData({
      national_id: surfer.national_id,
      full_name: surfer.full_name,
      phone: surfer.phone || "",
      email: surfer.email || "",
      residence: surfer.residence || "",
      age: surfer.age?.toString() || "",
      date_of_birth: surfer.date_of_birth || "",
      gender: surfer.gender || "",
      status: surfer.status || "בהמתנה",
      program: surfer.program || "",
      group_id: surfer.group_id || "", // Populate group_id here
      medical_approval: surfer.medical_approval || false,
      medical_condition: surfer.medical_condition || "",
      needs_wheelchair: surfer.needs_wheelchair || false,
      volunteers_needed: surfer.volunteers_needed?.toString() || "",
      special_requirements: surfer.special_requirements || "",
      emergency_contact_name: surfer.emergency_contact_name || "",
      emergency_contact_phone: surfer.emergency_contact_phone || "",
      active: surfer.active,
      notes: surfer.notes || "",
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
      const url = editingSurfer ? "/api/surfer/update" : "/api/surfer/add";
      const method = editingSurfer ? "PUT" : "POST";

      const body: any = {
        national_id: formData.national_id,
        full_name: formData.full_name,
        phone: formData.phone || null,
        email: formData.email || null,
        residence: formData.residence || null,
        age: formData.age ? parseInt(formData.age) : null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        status: formData.status || null,
        program: formData.program || null,
        group_id: formData.group_id || null, // Add group_id to body
        medical_approval: formData.medical_approval,
        medical_condition: formData.medical_condition || null,
        needs_wheelchair: formData.needs_wheelchair,
        volunteers_needed: formData.volunteers_needed
          ? parseInt(formData.volunteers_needed)
          : null,
        special_requirements: formData.special_requirements || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        active: formData.active,
        notes: formData.notes || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert(editingSurfer ? "גולש עודכן בהצלחה!" : "גולש נוסף בהצלחה!");
        setShowModal(false);
        fetchSurfers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving surfer:", err);
      alert("שגיאה בשמירת גולש");
    }
  };

  const handleDelete = async (national_id: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את הגולש?")) return;

    try {
      const res = await fetch(`/api/surfer/update?national_id=${national_id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("גולש בוטל בהצלחה!");
        fetchSurfers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting surfer:", err);
      alert("שגיאה במחיקת גולש");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען גולשים...</div>
      </div>
    );
  }

  // Count by program
  const programCounts: Record<string, number> = {};
  surfers.forEach((s) => {
    if (s.program) {
      programCounts[s.program] = (programCounts[s.program] || 0) + 1;
    }
  });

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <Card style={{ marginBottom: spacing.lg }}>
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
              🏄 ניהול גולשים
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {surfers.length} גולשים במערכת
            </div>
          </div>
          <Button onClick={handleAdd}>
            + הוסף גולש
          </Button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <select
              style={inputStyle}
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
            >
              <option value="">כל התוכניות</option>
              {PROGRAM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p} ({programCounts[p] || 0})
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
              {STATUS_OPTIONS.map((s) => (
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
                <th style={{ textAlign: "right", padding: 8 }}>ת.ז.</th>
                <th style={{ textAlign: "right", padding: 8 }}>שם</th>
                <th style={{ textAlign: "center", padding: 8 }}>תוכנית</th>
                <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
                <th style={{ textAlign: "center", padding: 8 }}>גיל</th>
                <th style={{ textAlign: "center", padding: 8 }}>טלפון</th>
                <th style={{ textAlign: "center", padding: 8 }}>אישור רפואי</th>
                <th style={{ textAlign: "center", padding: 8 }}>מתנדבים</th>
                <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {surfers.map((s) => (
                <tr
                  key={s.national_id}
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
                    {s.national_id}
                  </td>
                  <td style={{ padding: 8, fontWeight: 600 }}>
                    {s.full_name}
                    {s.needs_wheelchair && (
                      <span style={{ marginRight: 6 }}>♿</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, fontSize: 13 }}>
                    {s.program || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        background:
                          s.status === "מאושר"
                            ? "rgba(34, 197, 94, 0.1)"
                            : s.status === "בהמתנה"
                            ? "rgba(251, 191, 36, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        color:
                          s.status === "מאושר"
                            ? "#16a34a"
                            : s.status === "בהמתנה"
                            ? "#d97706"
                            : "#dc2626",
                      }}
                    >
                      {s.status || "—"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {s.age || "—"}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      padding: 8,
                      color: muted,
                      fontSize: 13,
                    }}
                  >
                    {s.phone || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    {s.medical_approval ? "✅" : "❌"}
                  </td>
                  <td
                    style={{ textAlign: "center", padding: 8, fontWeight: 600 }}
                  >
                    {s.volunteers_needed || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <Button
                      variant="secondary"
                      style={{ marginLeft: 4, fontSize: 12 }}
                      onClick={() => setViewingSurfer(s)}
                    >
                      👁️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ marginLeft: 4, fontSize: 12 }}
                      onClick={() => handleEdit(s)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ color: colors.danger, fontSize: 12 }}
                      onClick={() => handleDelete(s.national_id)}
                    >
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))}
              {surfers.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין גולשים במערכת. לחץ על "הוסף גולש" להתחיל.
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
        width="min(900px, 95vw)"
        style={{ padding: 24 }}
        overlayStyle={{ padding: `${spacing.xl}px 0` }}
      >
        <div>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800 }}>
              {editingSurfer ? "ערוך גולש" : "הוסף גולש חדש"}
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
                    disabled={!!editingSurfer}
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
                  <label style={labelStyle}>מקום מגורים</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.residence}
                    onChange={(e) =>
                      setFormData({ ...formData, residence: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>תאריך לידה</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date_of_birth: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>גיל</label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>מגדר</label>
                  <select
                    style={inputStyle}
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="">בחר...</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>קבוצה (אופציונלי)</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.group_id}
                    onChange={(e) =>
                      setFormData({ ...formData, group_id: e.target.value })
                    }
                    placeholder="מזהה קבוצה (GUID)"
                  />
                </div>
              </div>
            </div>

            {/* תוכנית וסטטוס */}
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
                🎯 תוכנית וסטטוס
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>תוכנית</label>
                  <select
                    style={inputStyle}
                    value={formData.program}
                    onChange={(e) =>
                      setFormData({ ...formData, program: e.target.value })
                    }
                  >
                    <option value="">בחר...</option>
                    {PROGRAM_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>סטטוס</label>
                  <select
                    style={inputStyle}
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>מספר מתנדבים נדרש</label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={formData.volunteers_needed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        volunteers_needed: e.target.value,
                      })
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* מצב רפואי */}
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
                🏥 מצב רפואי
              </h4>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={formData.medical_approval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medical_approval: e.target.checked,
                      })
                    }
                    style={{ marginLeft: 8 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    אושר רפואית
                  </span>
                </label>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={formData.needs_wheelchair}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        needs_wheelchair: e.target.checked,
                      })
                    }
                    style={{ marginLeft: 8 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    זקוק לכיסא גלגלים
                  </span>
                </label>
              </div>
              <div>
                <label style={labelStyle}>מצב רפואי / הערות רפואיות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  value={formData.medical_condition}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      medical_condition: e.target.value,
                    })
                  }
                  placeholder="תאר מצב רפואי, תרופות, אלרגיות..."
                />
              </div>
            </div>

            {/* איש קשר חירום */}
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
                🚨 איש קשר לחירום
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>שם איש קשר</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.emergency_contact_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label style={labelStyle}>טלפון איש קשר</label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={formData.emergency_contact_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_contact_phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* דרישות מיוחדות והערות */}
            <div
              style={{
                marginBottom: 20,
                padding: 16,
                background: "#f9fafb",
                borderRadius: 8,
              }}
            >
              <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
                📝 דרישות והערות
              </h4>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>דרישות מיוחדות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  value={formData.special_requirements}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      special_requirements: e.target.value,
                    })
                  }
                  placeholder="דרישות מיוחדות לפעילות..."
                />
              </div>
              <div>
                <label style={labelStyle}>הערות כלליות</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
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
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                ביטול
              </Button>
              <Button onClick={handleSubmit}>
                {editingSurfer ? "עדכן" : "הוסף"}
              </Button>
            </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        open={!!viewingSurfer}
        onClose={() => setViewingSurfer(null)}
        width="min(700px, 90vw)"
        style={{ padding: 24 }}
        overlayStyle={{ padding: `${spacing.lg}px 0` }}
      >
        {viewingSurfer && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                פרטי גולש - {viewingSurfer.full_name}
              </h3>
              <Button
                variant="secondary"
                onClick={() => setViewingSurfer(null)}
                style={{ fontSize: 13 }}
              >
                ✕ סגור
              </Button>
            </div>

            <ViewSection title="📋 פרטים אישיים">
              <InfoRow label="תעודת זהות" value={viewingSurfer.national_id} />
              <InfoRow label="טלפון" value={viewingSurfer.phone || "—"} />
              <InfoRow label="אימייל" value={viewingSurfer.email || "—"} />
              <InfoRow label="גיל" value={viewingSurfer.age?.toString() || "—"} />
              <InfoRow label="מגדר" value={viewingSurfer.gender || "—"} />
              <InfoRow label="מקום מגורים" value={viewingSurfer.residence || "—"} />
            </ViewSection>

            <ViewSection title="🎯 תוכנית וסטטוס">
              <InfoRow label="תוכנית" value={viewingSurfer.program || "—"} />
              <InfoRow label="סטטוס" value={viewingSurfer.status || "—"} />
              <InfoRow
                label="קבוצה"
                value={viewingSurfer.group_id || "לא שויכה"}
              />
              <InfoRow
                label="מתנדבים נדרשים"
                value={
                  viewingSurfer.volunteers_needed?.toString() ||
                  "לא הוגדר"
                }
              />
            </ViewSection>

            <ViewSection title="🏥 מצב רפואי">
              <InfoRow
                label="אישור רפואי"
                value={viewingSurfer.medical_approval ? "כן" : "לא"}
              />
              <InfoRow
                label="זקוק לכיסא גלגלים"
                value={viewingSurfer.needs_wheelchair ? "כן" : "לא"}
              />
              <InfoRow
                label="מצב רפואי"
                value={viewingSurfer.medical_condition || "—"}
              />
            </ViewSection>

            <ViewSection title="🚨 איש קשר לחירום">
              <InfoRow
                label="שם איש קשר"
                value={viewingSurfer.emergency_contact_name || "—"}
              />
              <InfoRow
                label="טלפון חירום"
                value={viewingSurfer.emergency_contact_phone || "—"}
              />
            </ViewSection>

            {!!viewingSurfer.special_requirements && (
              <ViewSection title="📝 דרישות מיוחדות">
                <p style={{ margin: 0 }}>{viewingSurfer.special_requirements}</p>
              </ViewSection>
            )}

            {!!viewingSurfer.notes && (
              <ViewSection title="הערות">
                <p style={{ margin: 0 }}>{viewingSurfer.notes}</p>
              </ViewSection>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

type ViewSectionProps = {
  title: string;
  children: React.ReactNode;
};

function ViewSection({ title, children }: ViewSectionProps) {
  return (
    <div
      style={{
        background: colors.surfaceAlt,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <h4
        style={{
          margin: 0,
          fontSize: 14,
          color: colors.textMuted,
          fontWeight: 700,
        }}
      >
        {title}
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
