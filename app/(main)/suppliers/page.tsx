"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { Supplier } from "@/type";
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

const pillStyle = (isActive: boolean): CSSProperties => ({
  display: "inline-block",
  padding: `${px(spacing.xs)} ${px(spacing.sm)}`,
  borderRadius: radii.button,
  fontSize: 12,
  fontWeight: 600,
  background: isActive ? colors.successSoft : colors.dangerSoft,
  color: isActive ? colors.success : colors.danger,
});

const identifierTypeOptions = [
  { value: "HP", label: "ח.פ" },
  { value: "OSEK", label: "עוסק מורשה" },
  { value: "ID", label: "ת.ז" },
  { value: "OTHER", label: "אחר" },
] as const;

type IdentifierType = (typeof identifierTypeOptions)[number]["value"];

type FormState = {
  supplier_identifier: string;
  identifier_type: IdentifierType;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  notes: string;
  is_active: boolean;
};

const createEmptyFormState = (): FormState => ({
  supplier_identifier: "",
  identifier_type: identifierTypeOptions[0].value,
  name: "",
  contact_name: "",
  phone: "",
  email: "",
  notes: "",
  is_active: true,
});

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<FormState>(createEmptyFormState());

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/suppliers", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.suppliers);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      alert("שגיאה בטעינת ספקים");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setFormData(createEmptyFormState());
    setShowModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplier_identifier: supplier.supplier_identifier,
      identifier_type:
        (identifierTypeOptions.find(
          (opt) => opt.value === supplier.identifier_type
        )?.value as IdentifierType) || identifierTypeOptions[0].value,
      name: supplier.name,
      contact_name: supplier.contact_name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      notes: supplier.notes || "",
      is_active: supplier.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const supplierId = formData.supplier_identifier.trim().toUpperCase();
    if (!supplierId) {
      alert("מספר הספק הוא שדה חובה");
      return;
    }

    if (!formData.identifier_type) {
      alert("סוג המזהה הוא שדה חובה");
      return;
    }

    if (!formData.name.trim()) {
      alert("שם הספק הוא שדה חובה");
      return;
    }

    try {
      const url = editingSupplier ? "/api/suppliers/update" : "/api/suppliers/add";
      const method = editingSupplier ? "PUT" : "POST";

      const body = {
        supplier_identifier: supplierId,
        identifier_type: formData.identifier_type,
        name: formData.name.trim(),
        contact_name: formData.contact_name.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        notes: formData.notes.trim() || null,
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
        alert(editingSupplier ? "ספק עודכן בהצלחה!" : "ספק נוסף בהצלחה!");
        setShowModal(false);
        setEditingSupplier(null);
        setFormData(createEmptyFormState());
        fetchSuppliers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error saving supplier:", err);
      alert("שגיאה בשמירת ספק");
    }
  };

  const handleDelete = async (supplier_identifier: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את הספק?")) return;

    try {
      const res = await fetch(
        `/api/suppliers/update?supplier_identifier=${encodeURIComponent(
          supplier_identifier
        )}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (data.success) {
        alert("ספק בוטל בהצלחה!");
        fetchSuppliers();
      } else {
        alert("שגיאה: " + data.error);
      }
    } catch (err) {
      console.error("Error deleting supplier:", err);
      alert("שגיאה במחיקת ספק");
    }
  };

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingSupplier(null);
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div>טוען ספקים...</div>
      </div>
    );
  }

  return (
    <>
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
                🤝 ניהול ספקים
              </h2>
              <div style={{ color: muted, fontSize: 13, marginTop: 4 }}>
                סה״כ {suppliers.length} ספקים במערכת
              </div>
            </div>
            <Button onClick={handleAdd}>+ הוסף ספק</Button>
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
              <thead style={{ borderBottom: `2px solid ${colors.borderMuted}` }}>
                <tr style={{ color: muted, fontSize: 13 }}>
                  <th style={{ textAlign: "center", padding: 8 }}>מספר ספק</th>
                  <th style={{ textAlign: "center", padding: 8 }}>שם הספק</th>
                  <th style={{ textAlign: "center", padding: 8 }}>סוג מזהה</th>
                  <th style={{ textAlign: "center", padding: 8 }}>איש קשר</th>
                  <th style={{ textAlign: "center", padding: 8 }}>טלפון</th>
                  <th style={{ textAlign: "center", padding: 8 }}>אימייל</th>
                  <th style={{ textAlign: "center", padding: 8 }}>סטטוס</th>
                  <th style={{ textAlign: "center", padding: 8 }}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr
                    key={supplier.supplier_identifier}
                    style={{ borderTop: `1px solid ${colors.borderMuted}` }}
                  >
                    <td
                      style={{
                        padding: 8,
                        color: muted,
                        fontFamily: "monospace",
                      }}
                    >
                      {supplier.supplier_identifier}
                    </td>
                    <td style={{ padding: 8, fontWeight: 600 }}>
                      {supplier.name}
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      {
                        identifierTypeOptions.find(
                          (type) => type.value === supplier.identifier_type
                        )?.label
                      }
                    </td>
                    <td style={{ textAlign: "center", padding: 8, color: muted }}>
                      {supplier.contact_name || "—"}
                    </td>
                    <td style={{ textAlign: "center", padding: 8, color: muted }}>
                      {formatPhoneNumber(supplier.phone)}
                    </td>
                    <td style={{ textAlign: "center", padding: 8, color: muted }}>
                      {supplier.email || "—"}
                    </td>
                    <td style={{ textAlign: "center", padding: 8 }}>
                      <span style={pillStyle(supplier.is_active)}>
                        {supplier.is_active ? "פעיל" : "לא פעיל"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: 8, whiteSpace: "nowrap" }}>
                      <Button
                        variant="secondary"
                        style={{ ...smallButtonStyle, marginLeft: 4 }}
                        onClick={() => handleView(supplier)}
                        title="צפייה"
                        aria-label="צפייה"
                      >
                        👁️
                      </Button>
                      <Button
                        variant="secondary"
                        style={{ ...smallButtonStyle, marginLeft: 4 }}
                        onClick={() => handleEdit(supplier)}
                        title="עריכה"
                        aria-label="עריכה"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="secondary"
                        style={{
                          ...smallButtonStyle,
                          color: colors.danger,
                        }}
                        onClick={() => handleDelete(supplier.supplier_identifier)}
                        title="מחיקה"
                        aria-label="מחיקה"
                      >
                        🗑️
                      </Button>
                    </td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: "center", padding: 20, color: muted }}
                    >
                      אין ספקים במערכת. לחץ על "הוסף ספק" להתחיל.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        width="min(640px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 800 }}>
          {editingSupplier ? "ערוך ספק" : "הוסף ספק חדש"}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>
                מספר ספק <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                type="text"
                style={inputStyle}
                value={formData.supplier_identifier}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    supplier_identifier: event.target.value.toUpperCase(),
                  })
                }
                placeholder="למשל: 51-1234567-8"
                maxLength={20}
                disabled={!!editingSupplier}
              />
            </div>
            <div>
              <label style={labelStyle}>
                סוג מזהה <span style={{ color: colors.danger }}>*</span>
              </label>
              <select
                style={inputStyle}
                value={formData.identifier_type}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    identifier_type: event.target.value as IdentifierType,
                  })
                }
              >
                {identifierTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={sectionBoxStyle}>
            <label style={labelStyle}>
              שם הספק <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              placeholder="שם החברה / הספק"
            />
          </div>

          <div style={sectionBoxStyle}>
            <label style={labelStyle}>שם איש קשר</label>
            <input
              type="text"
              style={inputStyle}
              value={formData.contact_name}
              onChange={(event) =>
                setFormData({ ...formData, contact_name: event.target.value })
              }
              placeholder="שם איש הקשר בחברה"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>טלפון</label>
              <input
                type="tel"
                style={inputStyle}
                value={formData.phone}
                onChange={(event) =>
                  setFormData({ ...formData, phone: event.target.value })
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
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
                placeholder="example@email.com"
              />
            </div>
          </div>

          <div style={sectionBoxStyle}>
            <label style={labelStyle}>הערות</label>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              value={formData.notes}
              onChange={(event) =>
                setFormData({ ...formData, notes: event.target.value })
              }
              placeholder="הערות נוספות..."
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(event) =>
                setFormData({ ...formData, is_active: event.target.checked })
              }
            />
            <label
              htmlFor="is_active"
              style={{ fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              ספק פעיל
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: spacing.md,
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
              {editingSupplier ? "עדכן" : "הוסף"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showViewModal && !!viewingSupplier}
        onClose={closeViewModal}
        width="min(600px, 95vw)"
        style={{ padding: spacing.xxl }}
      >
        {viewingSupplier && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: spacing.md,
                marginBottom: spacing.md,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                פרטי ספק – {viewingSupplier.name}
              </h3>
              <Button variant="secondary" type="button" onClick={closeViewModal}>
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
                  paddingBottom: spacing.xs,
                }}
              >
                פרטים מזהים
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: spacing.md,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>מספר ספק</div>
                  <div style={{ fontFamily: "monospace" }}>
                    {viewingSupplier.supplier_identifier}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סוג מזהה</div>
                  <div>
                    {
                      identifierTypeOptions.find(
                        (type) => type.value === viewingSupplier.identifier_type
                      )?.label
                    }
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>סטטוס</div>
                  <span style={pillStyle(viewingSupplier.is_active)}>
                    {viewingSupplier.is_active ? "פעיל" : "לא פעיל"}
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
                  paddingBottom: spacing.xs,
                }}
              >
                פרטי קשר
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: spacing.md,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: muted }}>איש קשר</div>
                  <div>{viewingSupplier.contact_name || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>טלפון</div>
                  <div>{formatPhoneNumber(viewingSupplier.phone)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: muted }}>אימייל</div>
                  <div>{viewingSupplier.email || "—"}</div>
                </div>
              </div>
            </div>

            {viewingSupplier.notes && (
              <div style={{ ...sectionBoxStyle, background: colors.surface }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14,
                    color: muted,
                    borderBottom: `2px solid ${colors.borderMuted}`,
                    paddingBottom: spacing.xs,
                  }}
                >
                  הערות
                </h4>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {viewingSupplier.notes}
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}


