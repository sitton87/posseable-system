"use client";

import {
  Title,
  Text,
  TextInput,
  Textarea,
  Select,
  SelectItem,
  Button,
  Switch,
  Card,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
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
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <Title>
            {mode === "family" ? "משפחה חדשה" : "קטגוריה חדשה"}
          </Title>
          <div className="flex gap-1">
            <Button
              variant={mode === "family" ? "primary" : "secondary"}
              size="sm"
              onClick={() => onSwitchMode("family")}
            >
              משפחה
            </Button>
            <Button
              variant={mode === "category" ? "primary" : "secondary"}
              size="sm"
              onClick={() => onSwitchMode("category")}
            >
              קטגוריה
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-5">
          <div className="flex flex-col gap-3">
            {mode === "category" && (
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  משפחה קיימת <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <Select
                  value={form.family_code || undefined}
                  onValueChange={(val) => onChange("family_code", val || "")}
                  placeholder="בחר משפחה"
                >
                  {families.map((family) => (
                    <SelectItem
                      key={`structure-family-${family.code}`}
                      value={family.code}
                    >
                      {family.code} · {family.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}
            <Text className="text-sm" style={{ color: cssVar.text.muted }}>
              הקוד ייווצר אוטומטית בעת השמירה.
            </Text>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שם <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <TextInput
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                תיאור
              </Text>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
              />
            </div>
            {mode === "family" ? (
              <>
                <div>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                    סוג ציוד
                  </Text>
                  <Select
                    value={form.equipment_type}
                    onValueChange={(val) =>
                      onChange(
                        "equipment_type",
                        val as StructureFormState["equipment_type"]
                      )
                    }
                  >
                    <SelectItem value="sea">ציוד ים</SelectItem>
                    <SelectItem value="support">ציוד מסייע</SelectItem>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.allow_item_images}
                    onChange={(val) => onChange("allow_item_images", val)}
                  />
                  <Text className="text-sm">לאפשר תמונות ברמת משפחה</Text>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.allow_consumables}
                    onChange={(val) => onChange("allow_consumables", val)}
                  />
                  <Text className="text-sm">לאפשר סימון מתכלה כברירת מחדל</Text>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.enforce_sku}
                    onChange={(val) => onChange("enforce_sku", val)}
                  />
                  <Text className="text-sm">חובה על מק״ט יצרן</Text>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.require_image}
                    onChange={(val) => onChange("require_image", val)}
                  />
                  <Text className="text-sm">דרישת תמונה לפריטים</Text>
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 mt-2">
              <Button variant="secondary" onClick={onClose}>
                ביטול
              </Button>
              <Button onClick={onSubmit} disabled={submitting}>
                {submitting ? "שומר..." : "שמור"}
              </Button>
            </div>
          </div>

          <Card className="max-h-[380px] overflow-y-auto">
            <Text className="font-semibold">
              מצב קיים ({mode === "family" ? "משפחות" : "קטגוריות"})
            </Text>
            <Text className="mt-1 text-sm" style={{ color: cssVar.text.muted }}>
              סקירה מהירה של המבנים וקשר לפריטים.
            </Text>
            <div className="mt-3">
              {mode === "family" ? (
                familiesWithCounts.length ? (
                  familiesWithCounts.map((family) => (
                    <div
                      key={`structure-side-family-${family.code}`}
                      className="flex justify-between text-sm py-1 border-b"
                      style={{ borderColor: cssVar.border.secondary }}
                    >
                      <span>
                        {family.code} · {family.name}
                      </span>
                      <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                        {family.itemCount} פריטים
                      </Text>
                    </div>
                  ))
                ) : (
                  <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                    אין משפחות במערכת.
                  </Text>
                )
              ) : !form.family_code ? (
                <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                  בחר משפחה כדי להציג קטגוריות קיימות.
                </Text>
              ) : (
                (categoriesWithCounts.filter(
                  (category) => category.family_code === form.family_code
                ).length &&
                  categoriesWithCounts
                    .filter((category) => category.family_code === form.family_code)
                    .map((category) => (
                      <div
                        key={`structure-side-category-${category.family_code}-${category.code}`}
                        className="flex justify-between text-sm py-1 border-b"
                        style={{ borderColor: cssVar.border.secondary }}
                      >
                        <span>
                          {category.code} · {category.name}
                        </span>
                        <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                          {category.itemCount} פריטים
                        </Text>
                      </div>
                    ))) || (
                  <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                    אין קטגוריות למשפחה זו.
                  </Text>
                )
              )}
            </div>
          </Card>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
