"use client";

import { Modal, Button } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { spacing } from "@/app/styles/foundations";
import type { WarehouseFormState } from "../types";

type WarehouseModalProps = {
  open: boolean;
  form: WarehouseFormState;
  submitting: boolean;
  isEditing?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChange: <K extends keyof WarehouseFormState>(
    key: K,
    value: WarehouseFormState[K]
  ) => void;
};

export function WarehouseModal({
  open,
  form,
  submitting,
  isEditing = false,
  onClose,
  onSubmit,
  onChange,
}: WarehouseModalProps) {
  const handleSubmit = () => {
    if (!submitting) {
      onSubmit();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(760px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      <h3 style={{ marginTop: 0, fontSize: 20, fontWeight: 800 }}>
        {isEditing ? "עריכת מחסן" : "מחסן חדש"}
      </h3>
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div>
            <label style={labelStyle}>קוד*</label>
            <input
              type="text"
              maxLength={20}
              style={inputStyle}
              value={form.code}
              onChange={(e) => onChange("code", e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label style={labelStyle}>שם*</label>
            <input
              type="text"
              style={inputStyle}
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>עיר</label>
            <input
              type="text"
              style={inputStyle}
              value={form.city}
              onChange={(e) => onChange("city", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>רחוב וכתובת</label>
            <input
              type="text"
              style={inputStyle}
              value={form.address_line}
              onChange={(e) => onChange("address_line", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>מיקוד</label>
            <input
              type="text"
              style={inputStyle}
              value={form.postal_code}
              onChange={(e) => onChange("postal_code", e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div>
            <label style={labelStyle}>מנהל המחסן</label>
            <input
              type="text"
              style={inputStyle}
              value={form.manager_name}
              onChange={(e) => onChange("manager_name", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>טלפון מנהל</label>
            <input
              type="text"
              style={inputStyle}
              value={form.manager_phone}
              onChange={(e) => onChange("manager_phone", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>אימייל מנהל</label>
            <input
              type="email"
              style={inputStyle}
              value={form.manager_email}
              onChange={(e) => onChange("manager_email", e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div>
            <label style={labelStyle}>איש קשר נוסף</label>
            <input
              type="text"
              style={inputStyle}
              value={form.contact_name}
              onChange={(e) => onChange("contact_name", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>טלפון איש קשר</label>
            <input
              type="text"
              style={inputStyle}
              value={form.contact_phone}
              onChange={(e) => onChange("contact_phone", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>עלות שכירות (חודשי)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              style={inputStyle}
              value={form.rent_cost}
              onChange={(e) => onChange("rent_cost", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>מטבע</label>
            <input
              type="text"
              maxLength={3}
              style={inputStyle}
              value={form.rent_currency}
              onChange={(e) =>
                onChange("rent_currency", e.target.value.toUpperCase())
              }
            />
          </div>
          <div>
            <label style={labelStyle}>תום חוזה שכירות</label>
            <input
              type="date"
              style={inputStyle}
              value={form.rent_expiry}
              onChange={(e) => onChange("rent_expiry", e.target.value)}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div>
            <label style={labelStyle}>הערות חוזה / מסמכים</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              value={form.lease_notes}
              onChange={(e) => onChange("lease_notes", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>הערות כלליות</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              value={form.general_notes}
              onChange={(e) => onChange("general_notes", e.target.value)}
            />
          </div>
        </div>

        <label
          style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
        >
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => onChange("is_active", e.target.checked)}
          />
          מחסן פעיל
        </label>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "שומר..." : isEditing ? "עדכן מחסן" : "שמור מחסן"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
