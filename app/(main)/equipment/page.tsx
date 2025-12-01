"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { Equipment } from "@/type";
import { Button, Card, Modal } from "@/app/components/ui";
import { inputStyle, labelStyle, withCenteredControl } from "@/app/styles/components";
import { colors, radii, spacing } from "@/app/styles/foundations";

const px = (value: number) => `${value}px`;
const muted = colors.textMuted;
const filterControlStyle = withCenteredControl(inputStyle);

const filtersContainerStyle: CSSProperties = {
  display: "flex",
  gap: spacing.md,
  flexWrap: "wrap",
};

const badgeStyle = (background: string, color: string): CSSProperties => ({
  display: "inline-block",
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
  borderRadius: radii.button,
  fontSize: 12,
  fontWeight: 600,
  background,
  color,
});

const smallButtonStyle: CSSProperties = {
  fontSize: 12,
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
};

const conditionBadgeMap: Record<
  string,
  { background: string; color: string }
> = {
  חדש: { background: colors.successSoft, color: colors.success },
  טוב: { background: colors.successSoft, color: colors.success },
  בינוני: { background: "rgba(251, 191, 36, 0.15)", color: "#d97706" },
  "דורש תיקון": { background: colors.warningSoft, color: colors.warning },
  "לא תקין": { background: colors.dangerSoft, color: colors.danger },
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
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
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

  const handleView = (eq: Equipment) => {
    setViewingEquipment(eq);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingEquipment(null);
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
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
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
    <div style={{ padding: spacing.xl }}>
      {/* Header */}
      <Card style={{ marginBottom: spacing.lg }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.md,
            gap: spacing.md,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              🛠️ ניהול ציוד
            </h2>
            <div style={{ color: muted, fontSize: 13, marginTop: px(2) }}>
              סה״כ {equipment.length} פריטי ציוד במערכת
            </div>
          </div>
          <Button onClick={handleAdd}>+ הוסף ציוד</Button>
        </div>

        {/* Filters */}
        <div style={filtersContainerStyle}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <select
              style={filterControlStyle}
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
          <div style={{ flex: 1, minWidth: 200 }}>
            <select
              style={filterControlStyle}
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
                      style={badgeStyle(
                        conditionBadgeMap[eq.condition || ""]?.background ||
                          colors.borderMuted,
                        conditionBadgeMap[eq.condition || ""]?.color ||
                          colors.textPrimary
                      )}
                    >
                      {eq.condition || "—"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <span
                      style={badgeStyle(
                        eq.active ? colors.successSoft : colors.dangerSoft,
                        eq.active ? colors.success : colors.danger
                      )}
                    >
                      {eq.active ? "פעיל" : "לא פעיל"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: 8 }}>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: spacing.xs }}
                      onClick={() => handleView(eq)}
                      title="צפייה בפרטי ציוד"
                      aria-label="צפייה"
                    >
                      👁️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, marginLeft: spacing.xs }}
                      onClick={() => handleEdit(eq)}
                      title="עריכת ציוד"
                      aria-label="עריכת ציוד"
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ ...smallButtonStyle, color: colors.danger }}
                      onClick={() => handleDelete(eq.id)}
                      title="מחיקת ציוד"
                      aria-label="מחיקת ציוד"
                    >
                      🗑️
                    </Button>
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
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        width="min(620px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
          {editingEquipment ? "ערוך ציוד" : "הוסף ציוד חדש"}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          <div>
            <label style={labelStyle}>
              שם הציוד <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="למשל: גלשן 8 רגל"
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

          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
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
              gap: spacing.md,
              marginTop: spacing.sm,
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowModal(false)}
            >
              ביטול
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editingEquipment ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showViewModal && !!viewingEquipment}
        onClose={closeViewModal}
        width="min(520px, 90vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingEquipment && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing.md,
                gap: spacing.md,
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                פרטי ציוד – {viewingEquipment.name}
              </h3>
              <Button variant="secondary" type="button" onClick={closeViewModal}>
                ✕ סגור
              </Button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: spacing.md,
                marginBottom: spacing.md,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: muted }}>קטגוריה</div>
                <div>{viewingEquipment.category || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>מידה</div>
                <div>{viewingEquipment.size || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>מצב</div>
                <span
                  style={badgeStyle(
                    conditionBadgeMap[viewingEquipment.condition || ""]?.background ||
                      colors.borderMuted,
                    conditionBadgeMap[viewingEquipment.condition || ""]?.color ||
                      colors.textPrimary
                  )}
                >
                  {viewingEquipment.condition || "—"}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
                <span
                  style={badgeStyle(
                    viewingEquipment.active ? colors.successSoft : colors.dangerSoft,
                    viewingEquipment.active ? colors.success : colors.danger
                  )}
                >
                  {viewingEquipment.active ? "פעיל" : "לא פעיל"}
                </span>
              </div>
            </div>

            {viewingEquipment.notes && (
              <div>
                <div style={{ fontSize: 12, color: muted, marginBottom: spacing.xs }}>
                  הערות
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{viewingEquipment.notes}</div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

