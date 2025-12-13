import { Modal, Button } from "@/app/components/ui";
import { FormGrid, Section } from "@/app/components/shared";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import { FormState, IdentifierType, SupplierType, identifierTypeOptions, supplierTypeOptions } from "../types";

type Props = {
  open: boolean;
  formData: FormState;
  editing: boolean;
  onChange: (updater: (prev: FormState) => FormState) => void;
  onSubmit: () => void;
  onClose: () => void;
  escEnabled?: boolean;
};

export default function SupplierModal({
  open,
  formData,
  editing,
  onChange,
  onSubmit,
  onClose,
  escEnabled = true,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(700px, 95vw)"
      style={{ padding: spacing.xxl }}
      escEnabled={escEnabled}
    >
      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
        {editing ? "עריכת ספק" : "ספק חדש"}
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.md,
          marginTop: spacing.md,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                onChange((prev) => ({
                  ...prev,
                  supplier_identifier: event.target.value.toUpperCase(),
                }))
              }
              disabled={editing}
              maxLength={20}
            />
          </div>
          <div>
            <label style={labelStyle}>סוג מזהה</label>
            <select
              style={inputStyle}
              value={formData.identifier_type}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  identifier_type: event.target.value as IdentifierType,
                }))
              }
            >
              {identifierTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>סוג ספק</label>
            <select
              style={inputStyle}
              value={formData.supplier_type}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  supplier_type: event.target.value as SupplierType,
                }))
              }
            >
              {supplierTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Section
          title="פרטי ספק"
          subtitle="שם וסיווג ראשוני"
          style={{ marginBottom: spacing.lg }}
          bodyStyle={{ gap: spacing.sm }}
        >
          <div>
            <label style={labelStyle}>
              שם הספק <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formData.name}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div>
            <label style={labelStyle}>שירותים / תחומי התמחות</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              value={formData.services_offered}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  services_offered: event.target.value,
                }))
              }
            />
          </div>
        </Section>

        <Section
          title="פרטי קשר"
          subtitle="איש קשר וערוצים"
          style={{ marginBottom: spacing.lg }}
          bodyStyle={{ gap: spacing.md }}
        >
          <FormGrid
            columns="repeat(auto-fit, minmax(220px, 1fr))"
            gap={spacing.md}
          >
            <div>
              <label style={labelStyle}>איש קשר</label>
              <input
                type="text"
                style={inputStyle}
                value={formData.contact_name}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    contact_name: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>טלפון</label>
              <input
                type="tel"
                style={inputStyle}
                value={formData.phone}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <div>
              <label style={labelStyle}>אימייל</label>
              <input
                type="email"
                style={inputStyle}
                value={formData.email}
                onChange={(event) =>
                  onChange((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>
          </FormGrid>
        </Section>

        <Section
          title="הערות"
          subtitle="רקע נוסף"
          style={{ marginBottom: spacing.lg }}
        >
          <textarea
            style={{ ...inputStyle, minHeight: 80 }}
            value={formData.notes}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </Section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: spacing.md,
          }}
        >
          <label
            style={{ display: "flex", alignItems: "center", gap: spacing.sm }}
          >
            <input
              type="checkbox"
              checked={formData.has_active_contract}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  has_active_contract: event.target.checked,
                }))
              }
            />
            חוזה פעיל
          </label>
          <label
            style={{ display: "flex", alignItems: "center", gap: spacing.sm }}
          >
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  is_active: event.target.checked,
                }))
              }
            />
            ספק פעיל
          </label>
        </div>

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
          <Button onClick={onSubmit}>{editing ? "עדכון" : "שמור"}</Button>
        </div>
      </div>
    </Modal>
  );
}

