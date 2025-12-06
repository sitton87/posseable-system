"use client";

import { Modal, Button } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import type {
  EquipmentCategory,
  EquipmentFamily,
  EquipmentItem,
  Supplier,
} from "@/type";
import type { EquipmentFormState } from "../types";
import { CONDITION_OPTIONS } from "../constants";

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
  suppliers: Supplier[];
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
  suppliers,
  onChange,
}: EquipmentFormModalProps) {
  const handleSubmit = () => {
    if (canEdit) {
      onSubmit();
    }
  };
  const activeSuppliers = suppliers.filter((supplier) => supplier.is_active);
  const ownershipOptions: EquipmentFormState["ownership_type"][] = [
    "item",
    "rental",
    "consignment",
  ];
  const ownershipLabels: Record<EquipmentFormState["ownership_type"], string> =
    {
      item: "פרטית",
      rental: "השכרה",
      consignment: "קונסיגנציה",
    };
  const handleOwnershipTypeChange = (
    value: EquipmentFormState["ownership_type"]
  ) => {
    if (!canEdit) return;
    onChange("ownership_type", value);
    if (value === "rental") {
      onChange("is_rental", true);
      onChange("is_consumable", false);
      onChange("min_stock", "");
    } else {
      onChange("is_rental", false);
      onChange("rental_expiry", "");
    }
  };
  const handleConsumableChange = (isConsumable: boolean) => {
    if (!canEdit) return;
    onChange("is_consumable", isConsumable);
    if (isConsumable) {
      onChange("is_sku_tracked", false);
      onChange("is_rental", false);
      if (formState.ownership_type === "rental") {
        onChange("ownership_type", "item");
      }
      onChange("rental_expiry", "");
    } else {
      onChange("min_stock", "");
    }
  };
  const handleSkuTrackedChange = (checked: boolean) => {
    if (!canEdit) return;
    if (checked && formState.is_consumable) {
      onChange("is_consumable", false);
      onChange("min_stock", "");
    }
    onChange("is_sku_tracked", checked);
  };
  const handleSupplierChange = (identifier: string) => {
    if (!canEdit) return;
    onChange("supplier_identifier", identifier);
    const supplierName =
      activeSuppliers.find(
        (supplier) => supplier.supplier_identifier === identifier
      )?.name || "";
    onChange("manufacturer_name", supplierName);
  };
  const handleImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("הקובץ גדול מדי (מעל 2MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange("default_image_url", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(960px, 95vw)"
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
        </div>
        <div>
          <label style={labelStyle}>תיאור</label>
          <textarea
            style={{ ...inputStyle, minHeight: 44, maxHeight: 140 }}
            rows={1}
            disabled={!canEdit}
            value={formState.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="מידע נוסף על הפריט..."
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
              onChange={(e) => onChange("manufacturer_sku", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>שם ספק</label>
            <select
              style={inputStyle}
              disabled={!canEdit}
              value={formState.supplier_identifier}
              onChange={(e) => handleSupplierChange(e.target.value)}
            >
              <option value="">בחר ספק</option>
              {activeSuppliers.map((supplier) => (
                <option
                  key={supplier.supplier_identifier}
                  value={supplier.supplier_identifier}
                >
                  {supplier.name}
                </option>
              ))}
            </select>
            {!formState.supplier_identifier && formState.manufacturer_name && (
              <div style={{ fontSize: 12, color: colors.textMuted }}>
                ספק נוכחי: {formState.manufacturer_name}
              </div>
            )}
          </div>
          <div>
            <label style={labelStyle}>מחיר עלות ליחידה</label>
            <input
              type="number"
              min="0"
              step="0.01"
              style={inputStyle}
              disabled={!canEdit}
              value={formState.purchase_cost}
              onChange={(e) => onChange("purchase_cost", e.target.value)}
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
            gap: spacing.md,
          }}
        >
          <div style={{ fontWeight: 600 }}>אופי שימוש</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: spacing.md,
            }}
          >
            <div>
              <label style={labelStyle}>סוג בעלות</label>
              <select
                style={inputStyle}
                disabled={!canEdit}
                value={formState.ownership_type}
                onChange={(e) =>
                  handleOwnershipTypeChange(
                    e.target.value as EquipmentFormState["ownership_type"]
                  )
                }
              >
                {ownershipOptions.map((option) => (
                  <option key={option} value={option}>
                    {ownershipLabels[option]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>סוג פריט</label>
              <select
                style={inputStyle}
                disabled={!canEdit}
                value={formState.is_consumable ? "consumable" : "regular"}
                onChange={(e) =>
                  handleConsumableChange(e.target.value === "consumable")
                }
              >
                <option value="regular">רגיל</option>
                <option value="consumable">מתכלה</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>סטטוס פריט</label>
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
                פריט פעיל
              </label>
            </div>
            <div>
              <label style={labelStyle}>סימון מק״ט ייחודי</label>
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
                  checked={formState.is_sku_tracked}
                  disabled={!canEdit}
                  onChange={(e) => handleSkuTrackedChange(e.target.checked)}
                />
                מנוהל לפי מק״ט ייחודי
              </label>
            </div>
          </div>
          {formState.ownership_type === "rental" && (
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
          {formState.is_consumable && (
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
          )}
          <div
            style={{
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            {
              'בחירה ב"השכרה" מנטרלת אופציית מתכלה. ניתן להגדיר קונסיגנציה כמצב ביניים (מתועד בלבד).'
            }
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
            <label style={labelStyle}>קישור לתמונה / מסמך</label>
            <input
              type="url"
              style={inputStyle}
              disabled={!canEdit}
              value={formState.default_image_url}
              onChange={(e) => onChange("default_image_url", e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              style={{ marginTop: spacing.xs }}
              disabled={!canEdit}
              onChange={handleImageFileChange}
            />
            <div style={{ fontSize: 12, color: colors.textMuted }}>
              ניתן להעלות קובץ עד 2MB או לספק קישור ישיר.
            </div>
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
