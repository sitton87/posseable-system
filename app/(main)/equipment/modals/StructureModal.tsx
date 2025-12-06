"use client";

import { Modal, Button } from "@/app/components/ui";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, spacing, radii } from "@/app/styles/foundations";
import type { EquipmentFamily, EquipmentCategory } from "@/type";
import type { StructureFormState } from "../types";

type StructureModalProps = {
  open: boolean;
  mode: StructureFormState["entityType"];
  form: StructureFormState;
  submitting: boolean;
  families: EquipmentFamily[];
  familiesWithCounts: (EquipmentFamily & { itemCount: number })[];
  categoriesWithCounts: (EquipmentCategory & {
    itemCount: number;
  })[];
  onClose: () => void;
  onSwitchMode: (mode: StructureFormState["entityType"]) => void;
  onChange: <K extends keyof StructureFormState>(
    key: K,
    value: StructureFormState[K]
  ) => void;
  onSubmit: () => void;
};

const muted = colors.textMuted;

export function StructureModal({
  open,
  mode,
  form,
  submitting,
  families,
  familiesWithCounts,
  categoriesWithCounts,
  onClose,
  onSwitchMode,
  onChange,
  onSubmit,
}: StructureModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(820px, 95vw)"
      style={{ padding: spacing.xxl }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>
          {mode === "family" ? "משפחה חדשה" : "קטגוריה חדשה"}
        </h3>
        <div style={{ display: "flex", gap: spacing.xs }}>
          <Button
            variant={mode === "family" ? "primary" : "secondary"}
            onClick={() => onSwitchMode("family")}
          >
            משפחה
          </Button>
          <Button
            variant={mode === "category" ? "primary" : "secondary"}
            onClick={() => onSwitchMode("category")}
          >
            קטגוריה
          </Button>
        </div>
      </div>
      <div
        style={{
          marginTop: spacing.md,
          display: "grid",
          gridTemplateColumns: "minmax(360px, 1fr) minmax(280px, 1fr)",
          gap: spacing.lg,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm,
          }}
        >
          {mode === "category" && (
            <div>
              <label style={labelStyle}>משפחה קיימת*</label>
              <select
                style={inputStyle}
                value={form.family_code}
                onChange={(e) => onChange("family_code", e.target.value)}
              >
                <option value="">בחר משפחה</option>
                {families.map((family) => (
                  <option
                    key={`structure-family-${family.code}`}
                    value={family.code}
                  >
                    {family.code} · {family.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <p style={{ color: muted, fontSize: 13, margin: 0 }}>
              הקוד ייווצר אוטומטית בעת השמירה.
            </p>
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
            <label style={labelStyle}>תיאור</label>
            <textarea
              style={{ ...inputStyle, minHeight: 70 }}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
            />
          </div>
          {mode === "family" ? (
            <>
              <div>
                <label style={labelStyle}>סוג ציוד</label>
                <select
                  style={inputStyle}
                  value={form.equipment_type}
                  onChange={(e) =>
                    onChange(
                      "equipment_type",
                      e.target.value as StructureFormState["equipment_type"]
                    )
                  }
                >
                  <option value="sea">ציוד ים</option>
                  <option value="support">ציוד מסייע</option>
                </select>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.xs,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.allow_item_images}
                  onChange={(e) =>
                    onChange("allow_item_images", e.target.checked)
                  }
                />
                לאפשר תמונות ברמת משפחה
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.xs,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.allow_consumables}
                  onChange={(e) =>
                    onChange("allow_consumables", e.target.checked)
                  }
                />
                לאפשר סימון מתכלה כברירת מחדל
              </label>
            </>
          ) : (
            <>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.xs,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.enforce_sku}
                  onChange={(e) => onChange("enforce_sku", e.target.checked)}
                />
                חובה על מק״ט יצרן
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.xs,
                }}
              >
                <input
                  type="checkbox"
                  checked={form.require_image}
                  onChange={(e) => onChange("require_image", e.target.checked)}
                />
                דרישת תמונה לפריטים
              </label>
            </>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: spacing.sm,
              marginTop: spacing.sm,
            }}
          >
            <Button variant="secondary" onClick={onClose}>
              ביטול
            </Button>
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting ? "שומר..." : "שמור"}
            </Button>
          </div>
        </div>
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: radii.card,
            padding: spacing.md,
            maxHeight: 380,
            overflowY: "auto",
          }}
        >
          <strong>
            מצב קיים ({mode === "family" ? "משפחות" : "קטגוריות"})
          </strong>
          <p style={{ marginTop: spacing.xs, color: muted, fontSize: 13 }}>
            סקירה מהירה של המבנים וקשר לפריטים.
          </p>
          {mode === "family" ? (
            familiesWithCounts.length ? (
              familiesWithCounts.map((family) => (
                <div
                  key={`structure-side-family-${family.code}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: `${spacing.xs}px 0`,
                    borderBottom: `1px solid ${colors.borderMuted}`,
                  }}
                >
                  <span>
                    {family.code} · {family.name}
                  </span>
                  <span style={{ color: muted }}>
                    {family.itemCount} פריטים
                  </span>
                </div>
              ))
            ) : (
              <div style={{ color: muted, fontSize: 13 }}>
                אין משפחות במערכת.
              </div>
            )
          ) : !form.family_code ? (
            <div style={{ color: muted, fontSize: 13 }}>
              בחר משפחה כדי להציג קטגוריות קיימות.
            </div>
          ) : (
            (categoriesWithCounts.filter(
              (category) => category.family_code === form.family_code
            ).length &&
              categoriesWithCounts
                .filter((category) => category.family_code === form.family_code)
                .map((category) => (
                  <div
                    key={`structure-side-category-${category.family_code}-${category.code}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      padding: `${spacing.xs}px 0`,
                      borderBottom: `1px solid ${colors.borderMuted}`,
                    }}
                  >
                    <span>
                      {category.code} · {category.name}
                    </span>
                    <span style={{ color: muted }}>
                      {category.itemCount} פריטים
                    </span>
                  </div>
                ))) || (
              <div style={{ color: muted, fontSize: 13 }}>
                אין קטגוריות למשפחה זו.
              </div>
            )
          )}
        </div>
      </div>
    </Modal>
  );
}
