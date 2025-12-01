"use client";

import type { CSSProperties, ChangeEvent } from "react";
import { useState, useEffect } from "react";
import {
  Volunteer,
  SEA_CONNECTION_LEVEL_OPTIONS,
  VOLUNTEER_TYPE_OPTIONS,
  MEDIA_SPECIALIZATION_OPTIONS,
} from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import {
  inputStyle,
  labelStyle,
  withCenteredControl,
} from "@/app/styles/components";
import { formatPhoneNumber } from "@/lib/utils/format";
import { colors, radii, spacing } from "@/app/styles/foundations";
import { usePagePermission } from "@/app/hooks/usePagePermission";
import { AccessDenied } from "@/app/components/AccessDenied";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;
const filterControlStyle = withCenteredControl(inputStyle);

const sectionBoxStyle: CSSProperties = {
  marginBottom: spacing.xl,
  padding: spacing.lg,
  background: colors.surfaceAlt,
  borderRadius: radii.card,
};

const smallButtonStyle: CSSProperties = {
  fontSize: 12,
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
};

const secondaryLinkStyle: CSSProperties = {
  ...smallButtonStyle,
  borderRadius: radii.button,
  border: `1px solid ${colors.border}`,
  background: colors.surfaceAlt,
  color: colors.textPrimary,
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
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

type DocumentEntry = {
  name: string;
  mime?: string;
  data?: string;
  url?: string;
  uploadDate?: string;
  uploadedAt?: string;
};

const parseDocuments = (value?: string | null): DocumentEntry[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => item && typeof item === "object" && item.name
      );
    }
    return [];
  } catch (err) {
    console.warn("Failed to parse documents JSON", err);
    return [];
  }
};

const buildDocumentDataUrl = (doc: DocumentEntry) => {
  if (doc.data) {
    return `data:${doc.mime || "application/octet-stream"};base64,${doc.data}`;
  }
  return doc.url || "";
};

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
  const [documentEntries, setDocumentEntries] = useState<DocumentEntry[]>([]);
  const viewingDocuments = viewingVolunteer
    ? parseDocuments(viewingVolunteer.documents)
    : [];

  const {
    permission,
    loading: permissionLoading,
    canEdit,
  } = usePagePermission("volunteers");

  const editWarning = () =>
    alert("אין לך הרשאת עריכה בדף מתנדבים. פנה למנהל המערכת.");

  const assertCanEdit = () => {
    if (!canEdit) {
      editWarning();
      return false;
    }
    return true;
  };

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

  if (permissionLoading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div>טוען הרשאות...</div>
      </div>
    );
  }

  if (permission === "none") {
    return (
      <AccessDenied
        title="אין לך הרשאה לדף מתנדבים"
        description="פנה למנהל המערכת כדי לקבל הרשאה מתאימה."
      />
    );
  }

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
    if (!assertCanEdit()) return;
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
    setDocumentEntries([]);
    setShowModal(true);
  };

  const handleView = (volunteer: Volunteer) => {
    setViewingVolunteer(volunteer);
    setShowViewModal(true);
  };

  const handleEdit = (volunteer: Volunteer) => {
    if (!assertCanEdit()) return;
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
    setDocumentEntries(parseDocuments(volunteer.documents));
    setShowModal(true);
  };

  const handleDocumentsTextChange = (value: string) => {
    setFormData((prev) => ({ ...prev, documents: value }));
    setDocumentEntries(parseDocuments(value));
  };

  const handleDocumentUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || "";
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      const newEntry: DocumentEntry = {
        name: file.name,
        mime: file.type,
        data: base64,
        uploadedAt: new Date().toISOString(),
      };
      const updated = [...documentEntries, newEntry];
      setDocumentEntries(updated);
      setFormData((prev) => ({
        ...prev,
        documents: JSON.stringify(updated, null, 2),
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleDocumentRemove = (index: number) => {
    const updated = documentEntries.filter((_, idx) => idx !== index);
    setDocumentEntries(updated);
    setFormData((prev) => ({
      ...prev,
      documents: updated.length ? JSON.stringify(updated, null, 2) : "",
    }));
  };

  const handleSubmit = async () => {
    if (!assertCanEdit()) return;
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
    if (!assertCanEdit()) return;
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
    <div style={{ padding: spacing.xl }}>
      {/* Header */}
      <Card style={{ marginBottom: spacing.lg }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: spacing.md,
            flexWrap: "wrap",
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
          <Button
            onClick={handleAdd}
            disabled={!canEdit}
            title={canEdit ? undefined : "אין לך הרשאת עריכה בדף זה"}
          >
            + הוסף מתנדב
          </Button>
        </div>
      </Card>

      {!canEdit && (
        <div
          style={{
            marginBottom: spacing.lg,
            border: "1px solid #fcd34d",
            background: "#fffbeb",
            color: "#92400e",
            padding: spacing.md,
            borderRadius: radii.card,
            fontSize: 13,
          }}
        >
          מצב קריאה בלבד: ניתן לצפות במידע אך לא לערוך או למחוק מתנדבים.
        </div>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: spacing.lg }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.md,
            gap: spacing.md,
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
            🔍 סינון מתנדבים
          </h3>
          <Button
            variant="secondary"
            style={{ fontSize: 12, padding: "6px 12px" }}
            onClick={clearFilters}
          >
            נקה סינונים
          </Button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: spacing.md,
          }}
        >
          {/* Filter by kind */}
          <div>
            <label style={labelStyle}>סוג מתנדב</label>
            <select
              style={filterControlStyle}
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
              style={filterControlStyle}
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
              style={filterControlStyle}
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
              style={filterControlStyle}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              disabled={!filterDateMode}
            />
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
                <th style={{ textAlign: "center", padding: 8 }}>ת.ז.</th>
                <th style={{ textAlign: "center", padding: 8 }}>שם</th>
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
                      textAlign: "center",
                    }}
                  >
                    {v.national_id}
                  </td>
                  <td style={{ padding: 8, fontWeight: 600, textAlign: "center" }}>
                    {v.full_name}
                  </td>
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
                    {formatPhoneNumber(v.phone)}
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
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: 4 }}
                      onClick={() => handleView(v)}
                      title="צפייה"
                    >
                      👁️
                    </Button>
                    {canEdit && (
                      <>
                        <Button
                          variant="secondary"
                          style={{ ...smallButtonStyle, marginLeft: 4 }}
                          onClick={() => handleEdit(v)}
                          title="עריכה"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="secondary"
                          style={{ ...smallButtonStyle, color: colors.danger }}
                          onClick={() => handleDelete(v.national_id)}
                          title="מחיקה"
                        >
                          🗑️
                        </Button>
                      </>
                    )}
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
      </Card>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        width="min(900px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ margin: "0 0 20px 0", fontSize: 18, fontWeight: 800 }}>
          {editingVolunteer ? "ערוך מתנדב" : "הוסף מתנדב חדש"}
        </h3>

        {/* פרטים אישיים */}
        <div style={sectionBoxStyle}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
            📋 פרטים אישיים
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
                תעודת זהות <span style={{ color: colors.danger }}>*</span>
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
                שם מלא <span style={{ color: colors.danger }}>*</span>
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
        <div style={sectionBoxStyle}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
            📍 כתובת
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: spacing.md,
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
        <div style={sectionBoxStyle}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
            🏄 פרטי התנדבות
          </h4>

          {/* סוג מתנדב */}
          <div style={{ marginBottom: spacing.md }}>
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
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: spacing.md,
              marginBottom: spacing.md,
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
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: spacing.md,
            }}
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
              <label style={labelStyle}>מסמכים מצורפים</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleDocumentUpload}
                style={{ marginBottom: spacing.xs }}
              />
              <div
                style={{ fontSize: 12, color: muted, marginBottom: spacing.xs }}
              >
                תמיכה ב-PDF ותמונות. עד 1 קובץ בכל פעם.
              </div>
              {documentEntries.length > 0 && (
                <div
                  style={{
                    border: `1px solid ${colors.borderMuted}`,
                    borderRadius: radii.card,
                    padding: spacing.md,
                    display: "flex",
                    flexDirection: "column",
                    gap: spacing.sm,
                    marginBottom: spacing.sm,
                    background: colors.surface,
                  }}
                >
                  {documentEntries.map((doc, idx) => (
                    <div
                      key={`${doc.name}-${idx}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: spacing.md,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{doc.name}</div>
                        <div style={{ fontSize: 12, color: muted }}>
                          {doc.mime || "קובץ"}
                          {doc.uploadedAt
                            ? ` · ${new Date(doc.uploadedAt).toLocaleDateString(
                                "he-IL"
                              )}`
                            : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: spacing.sm }}>
                        {buildDocumentDataUrl(doc) && (
                          <a
                            href={buildDocumentDataUrl(doc)}
                            download={doc.name}
                            target="_blank"
                            rel="noreferrer"
                            style={secondaryLinkStyle}
                          >
                            הורד
                          </a>
                        )}
                        <Button
                          variant="secondary"
                          style={{ ...smallButtonStyle, color: colors.danger }}
                          onClick={() => handleDocumentRemove(idx)}
                          type="button"
                        >
                          מחק
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <label style={{ ...labelStyle, marginTop: spacing.sm }}>
                מסמכים (JSON - למתקדמים)
              </label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                value={formData.documents}
                onChange={(e) => handleDocumentsTextChange(e.target.value)}
                placeholder='[{"name": "אישור רפואי", "url": "...", "uploadDate": "2024-01-01"}]'
              />
              <div
                style={{ fontSize: 11, color: muted, marginTop: spacing.xs }}
              >
                ניתן לערוך ידנית, או להשתמש בשדה העלאה כדי לעדכן את הרשימה
                אוטומטית.
              </div>
            </div>
          </div>
        </div>

        {/* הערות */}
        <div style={sectionBoxStyle}>
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
            gap: spacing.md,
            justifyContent: "flex-end",
            marginTop: spacing.xl,
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
            {editingVolunteer ? "עדכן" : "הוסף"}
          </Button>
        </div>
      </Modal>

      {/* מודל צפייה */}
      <Modal
        open={showViewModal && !!viewingVolunteer}
        onClose={() => setShowViewModal(false)}
        width="min(900px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingVolunteer && (
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
                פרטי מתנדב - {viewingVolunteer.full_name}
              </h3>
              <Button
                variant="secondary"
                onClick={() => setShowViewModal(false)}
                type="button"
              >
                ✕ סגור
              </Button>
            </div>

            {/* פרטים אישיים */}
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
                  <div>{formatPhoneNumber(viewingVolunteer.phone)}</div>
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
                            style={{ color: colors.accent }}
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
                        borderRadius: radii.button,
                        fontSize: 12,
                        fontWeight: 600,
                        background: viewingVolunteer.active
                          ? colors.successSoft
                          : colors.dangerSoft,
                        color: viewingVolunteer.active
                          ? colors.success
                          : colors.danger,
                      }}
                    >
                      {viewingVolunteer.active ? "פעיל" : "לא פעיל"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* מסמכים */}
            {viewingDocuments.length > 0 && (
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
                  📄 מסמכים
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: spacing.sm,
                  }}
                >
                  {viewingDocuments.map((doc, idx) => (
                    <div
                      key={`${doc.name}-${idx}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: radii.card,
                        border: `1px solid ${colors.borderMuted}`,
                        background: colors.surfaceAlt,
                        gap: spacing.md,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{doc.name}</div>
                        <div style={{ fontSize: 12, color: muted }}>
                          {doc.mime || "קובץ"}
                          {doc.uploadedAt || doc.uploadDate
                            ? ` · ${new Date(
                                doc.uploadedAt || doc.uploadDate!
                              ).toLocaleDateString("he-IL")}`
                            : ""}
                        </div>
                      </div>
                      {buildDocumentDataUrl(doc) && (
                        <a
                          href={buildDocumentDataUrl(doc)}
                          download={doc.name}
                          target="_blank"
                          rel="noreferrer"
                          style={secondaryLinkStyle}
                        >
                          הורד
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* הערות */}
            {viewingVolunteer.notes && (
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
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {viewingVolunteer.notes}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
