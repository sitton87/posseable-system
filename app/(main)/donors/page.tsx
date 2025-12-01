"use client";

import type { CSSProperties } from "react";
import { useState, useEffect } from "react";
import { Donor } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { formatPhoneNumber } from "@/lib/utils/format";
import { colors, radii, spacing } from "@/app/styles/foundations";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;
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
const pillStyle = (active: boolean): CSSProperties => ({
  padding: "4px 8px",
  borderRadius: radii.button,
  fontSize: 12,
  fontWeight: 600,
  background: active ? colors.successSoft : colors.dangerSoft,
  color: active ? colors.success : colors.danger,
});

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
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingDonor(null);
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div>טוען תורמים...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.xl }}>
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
              ❤️ ניהול תורמים
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
              סה״כ {donors.length} תורמים במערכת
            </div>
          </div>
          <Button onClick={handleAdd}>+ הוסף תורם</Button>
        </div>
      </Card>

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
                <th style={{ textAlign: "center", padding: 8 }}>ת.ז</th>
                <th style={{ textAlign: "center", padding: 8 }}>שם</th>
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
                  key={d.national_id}
                  style={{ borderTop: "1px solid rgba(15,23,42,0.08)" }}
                >
                  <td
                    style={{
                      padding: 8,
                      color: muted,
                      fontFamily: "monospace",
                      textAlign: "center",
                    }}
                  >
                    {d.national_id}
                  </td>
                  <td style={{ padding: 8, fontWeight: 600, textAlign: "center" }}>
                    {d.full_name}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {d.organization || "—"}
                  </td>
                  <td style={{ textAlign: "center", padding: 8, color: muted }}>
                    {formatPhoneNumber(d.phone)}
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
                    <span style={pillStyle(d.is_active)}>
                      {d.is_active ? "פעיל" : "לא פעיל"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: 4 }}
                      onClick={() => {
                        setViewingDonor(d);
                        setShowViewModal(true);
                      }}
                      title="צפייה"
                      aria-label="צפייה"
                    >
                      👁️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: 4 }}
                      onClick={() => handleEdit(d)}
                      title="עריכה"
                      aria-label="עריכה"
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, color: colors.danger }}
                      onClick={() => handleDelete(d.national_id)}
                      title="מחיקה"
                      aria-label="מחיקה"
                    >
                      🗑️
                    </Button>
                  </td>
                </tr>
              ))}
              {donors.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 20, color: muted }}
                  >
                    אין תורמים במערכת. לחץ על "הוסף תורם" להתחיל.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        width="min(600px, 90vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
          {editingDonor ? "ערוך תורם" : "הוסף תורם חדש"}
        </h3>

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
                שם התורם <span style={{ color: colors.danger }}>*</span>
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
        </div>

        <div style={sectionBoxStyle}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
            🏢 פרטי התקשרות
          </h4>
          <div style={{ marginBottom: spacing.md }}>
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
              gap: spacing.md,
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
        </div>

        <div style={sectionBoxStyle}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 14, color: muted }}>
            📝 הערות והעדפות
          </h4>
          <div style={{ marginBottom: spacing.md }}>
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
            style={{ display: "flex", alignItems: "center", gap: spacing.sm }}
          >
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
        </div>

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
            {editingDonor ? "עדכן" : "הוסף"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={showViewModal && !!viewingDonor}
        onClose={closeViewModal}
        width="min(600px, 90vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingDonor && (
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
                פרטי תורם
              </h3>
              <Button
                variant="secondary"
                onClick={closeViewModal}
                type="button"
              >
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
                📋 פרטים כלליים
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: spacing.md,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>תעודת זהות</div>
                  <div style={{ fontFamily: "monospace" }}>
                    {viewingDonor.national_id}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>שם מלא</div>
                  <div style={{ fontWeight: 600 }}>
                    {viewingDonor.full_name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>ארגון</div>
                  <div>{viewingDonor.organization || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
                  <span style={pillStyle(viewingDonor.is_active)}>
                    {viewingDonor.is_active ? "פעיל" : "לא פעיל"}
                  </span>
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
                📞 פרטי התקשרות
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: spacing.md,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>טלפון</div>
                  <div>{formatPhoneNumber(viewingDonor.phone)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>אימייל</div>
                  <div>{viewingDonor.email || "—"}</div>
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
                📝 הערות
              </h4>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {viewingDonor.notes || "—"}
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
