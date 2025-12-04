"use client";

import { Modal, Button } from "@/app/components/ui";
import {
  badgeStyle,
  inputStyle,
  labelStyle,
} from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type {
  EquipmentCategory,
  EquipmentFamily,
  EquipmentItem,
} from "@/type";
import type { EquipmentFormState } from "../types";
import {
  CONDITION_OPTIONS,
  conditionBadgeMap,
  getConditionLabel,
} from "../constants";
import { formatDate } from "../utils";

type EquipmentFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  formState: EquipmentFormState;
  formCategories: EquipmentCategory[];
  families: EquipmentFamily[];
  editingItem: EquipmentItem | null;
  canEdit: boolean;
  onChange: <K extends keyof EquipmentFormState>(
    key: K,
    value: EquipmentFormState[K]
  ) => void;
};

export function EquipmentFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  formState,
  formCategories,
  families,
  editingItem,
  canEdit,
  onChange,
}: EquipmentFormModalProps) {
  const handleSubmit = () => {
    if (canEdit) {
      onSubmit();
    }
  };

  const usageMode = formState.is_consumable
    ? "consumable"
    : formState.is_rental
    ? "rental"
    : "none";

  const handleUsageModeChange = (mode: "none" | "consumable" | "rental") => {
    if (!canEdit) return;
    if (mode === "consumable") {
      onChange("is_consumable", true);
      onChange("is_rental", false);
      onChange("rental_expiry", "");
    } else if (mode === "rental") {
      onChange("is_rental", true);
      onChange("is_consumable", false);
    } else {
      onChange("is_consumable", false);
      onChange("is_rental", false);
      onChange("rental_expiry", "");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(720px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      <h3 style={{ marginTop: 0, fontSize: 20, fontWeight: 800 }}>
        {editingItem ? "עריכת פריט ציוד" : "פריט ציוד חדש"}
      </h3>
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
      >
        <div
          style={{
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: spacing.xs / 2,
          }}
        >
          <input
            type="checkbox"
            checked={formState.is_active}
            disabled={!canEdit}
            onChange={(e) => onChange("is_active", e.target.checked)}
          />
          <span style={{ fontWeight: 600 }}>פריט פעיל</span>
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            בטל סימון אם הפריט אינו זמין לשימוש.
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: spacing.md,
          }}
        >
          <div>
            <label style={labelStyle}>משפחה*</label>
            <select
              style={inputStyle}
              value={formState.family_code}
              disabled={!canEdit}
              onChange={(e) => onChange("family_code", e.target.value)}
            >
              <option value="">בחר משפחה</option>
              {families.map((family) => (
                <option key={family.code} value={family.code}>
                  {family.code} · {family.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>קטגוריה*</label>
            <select
              style={inputStyle}
              value={formState.category_code}
              disabled={!canEdit}
              onChange={(e) => onChange("category_code", e.target.value)}
            >
              <option value="">בחר קטגוריה</option>
              {formCategories.map((category) => (
                <option
                  key={`${category.family_code}-${category.code}`}
                  value={category.code}
                >
                  {category.code} · {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>שם הפריט*</label>
          <input
            type="text"
            style={inputStyle}
            disabled={!canEdit}
            value={formState.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="למשל: גלשן פאן 8'"
          />
        </div>
        <div>
          <label style={labelStyle}>תיאור</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80 }}
            disabled={!canEdit}
            value={formState.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="מידע נוסף על הפריט..."
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
            <label style={labelStyle}>מצב</label>
            <select
              style={inputStyle}
              disabled={!canEdit}
              value={formState.condition}
              onChange={(e) => onChange("condition", e.target.value)}
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>מקט יצרן</label>
            <input
              type="text"
              style={inputStyle}
              disabled={!canEdit}
              value={formState.manufacturer_sku}
              onChange={(e) =>
                onChange("manufacturer_sku", e.target.value)
              }
            />
          </div>
          <div>
            <label style={labelStyle}>שם יצרן</label>
            <input
              type="text"
              style={inputStyle}
              disabled={!canEdit}
              value={formState.manufacturer_name}
              onChange={(e) =>
                onChange("manufacturer_name", e.target.value)
              }
            />
          </div>
          <div>
            <label style={labelStyle}>עלות רכישה</label>
            <input
              type="number"
              min="0"
              step="0.01"
              style={inputStyle}
              disabled={!canEdit}
              value={formState.purchase_cost}
              onChange={(e) =>
                onChange("purchase_cost", e.target.value)
              }
            />
          </div>
        </div>
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: spacing.sm,
            padding: spacing.md,
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: spacing.sm,
            }}
          >
            <div style={{ fontWeight: 600 }}>אופי שימוש</div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.xs / 2,
                fontSize: 13,
              }}
            >
              <input
                type="checkbox"
                checked={formState.is_active}
                disabled={!canEdit}
                onChange={(e) => onChange("is_active", e.target.checked)}
              />
              <span>פריט פעיל</span>
            </label>
          </div>
          <div
            style={{
              display: "flex",
              gap: spacing.sm,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {[
              { value: "none", label: "ללא" },
              { value: "consumable", label: "מתכלה" },
              { value: "rental", label: "בהשכרה" },
            ].map((option) => (
              <label
                key={option.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.xs / 2,
                  cursor: canEdit ? "pointer" : "not-allowed",
                }}
              >
                <input
                  type="radio"
                  name="usageMode"
                  value={option.value}
                  checked={usageMode === option.value}
                  disabled={!canEdit}
                  onChange={() =>
                    handleUsageModeChange(option.value as typeof usageMode)
                  }
                />
                {option.label}
              </label>
            ))}
            <label
              style={{
                marginInlineStart: "auto",
                display: "flex",
                alignItems: "center",
                gap: spacing.xs / 2,
              }}
            >
              <input
                type="checkbox"
                checked={formState.is_sku_tracked}
                disabled={!canEdit}
                onChange={(e) =>
                  onChange("is_sku_tracked", e.target.checked)
                }
              />
              מנוהל לפי מק״ט ייחודי
            </label>
          </div>
          {formState.is_rental && (
            <div>
              <label style={labelStyle}>תוקף השכרה</label>
              <input
                type="date"
                style={inputStyle}
                disabled={!canEdit}
                value={formState.rental_expiry}
                onChange={(e) => onChange("rental_expiry", e.target.value)}
              />
            </div>
          )}
          <div
            style={{
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            ניתן לבחור מתכלה או השכרה בלבד. בחירה באפשרות אחת תבטל את השנייה.
          </div>
        </div>
        {!formState.is_sku_tracked && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>מלאי מינימלי</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                disabled={!canEdit}
                value={formState.min_stock}
                onChange={(e) => onChange("min_stock", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>מלאי מקסימלי</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                disabled={!canEdit}
                value={formState.max_stock}
                onChange={(e) => onChange("max_stock", e.target.value)}
              />
            </div>
          </div>
        )}
        <div>
          <label style={labelStyle}>קישור לתמונה / מסמך</label>
          <input
            type="url"
            style={inputStyle}
            disabled={!canEdit}
            value={formState.default_image_url}
            onChange={(e) =>
              onChange("default_image_url", e.target.value)
            }
          />
        </div>
        <div>
          <label style={labelStyle}>הערות</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80 }}
            disabled={!canEdit}
            value={formState.notes}
            onChange={(e) => onChange("notes", e.target.value)}
          />
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
          <Button onClick={handleSubmit} disabled={isSubmitting || !canEdit}>
            {isSubmitting ? "שומר..." : editingItem ? "עדכן" : "צור פריט"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

