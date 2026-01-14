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
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
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
  escEnabled?: boolean;
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
  escEnabled = true,
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
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-4xl">
        <Title className="mb-6">
          {editingItem ? "עריכת פריט ציוד" : "פריט ציוד חדש"}
        </Title>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                משפחה <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <Select
                value={formState.family_code || undefined}
                onValueChange={(val) => onChange("family_code", val || "")}
                disabled={!canEdit}
                placeholder="בחר משפחה"
              >
                {families.map((family) => (
                  <SelectItem key={family.code} value={family.code}>
                    {family.code} · {family.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                קטגוריה <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <Select
                value={formState.category_code || undefined}
                onValueChange={(val) => onChange("category_code", val || "")}
                disabled={!canEdit}
                placeholder="בחר קטגוריה"
              >
                {formCategories.map((category) => (
                  <SelectItem
                    key={`${category.family_code}-${category.code}`}
                    value={category.code}
                  >
                    {category.code} · {category.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שם הפריט <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <TextInput
                disabled={!canEdit}
                value={formState.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="למשל: גלשן פאן 8'"
              />
            </div>
          </div>

          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              תיאור
            </Text>
            <Textarea
              rows={2}
              disabled={!canEdit}
              value={formState.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="מידע נוסף על הפריט..."
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                מצב
              </Text>
              <Select
                disabled={!canEdit}
                value={formState.condition}
                onValueChange={(val) => onChange("condition", val)}
              >
                {CONDITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                מקט יצרן
              </Text>
              <TextInput
                disabled={!canEdit}
                value={formState.manufacturer_sku}
                onChange={(e) => onChange("manufacturer_sku", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שם ספק
              </Text>
              <Select
                disabled={!canEdit}
                value={formState.supplier_identifier || undefined}
                onValueChange={(val) => handleSupplierChange(val || "")}
                placeholder="בחר ספק"
              >
                {activeSuppliers.map((supplier) => (
                  <SelectItem
                    key={supplier.supplier_identifier}
                    value={supplier.supplier_identifier}
                  >
                    {supplier.name}
                  </SelectItem>
                ))}
              </Select>
              {!formState.supplier_identifier && formState.manufacturer_name && (
                <Text className="text-xs mt-1" style={{ color: cssVar.text.muted }}>
                  ספק נוכחי: {formState.manufacturer_name}
                </Text>
              )}
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                מחיר עלות ליחידה
              </Text>
              <TextInput
                type="number"
                disabled={!canEdit}
                value={formState.purchase_cost}
                onChange={(e) => onChange("purchase_cost", e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 flex flex-col gap-4" style={{ borderColor: cssVar.border.primary }}>
            <Text className="font-semibold">אופי שימוש</Text>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  סוג בעלות
                </Text>
                <Select
                  disabled={!canEdit}
                  value={formState.ownership_type}
                  onValueChange={(val) =>
                    handleOwnershipTypeChange(
                      val as EquipmentFormState["ownership_type"]
                    )
                  }
                >
                  {ownershipOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {ownershipLabels[option]}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  סוג פריט
                </Text>
                <Select
                  disabled={!canEdit}
                  value={formState.is_consumable ? "consumable" : "regular"}
                  onValueChange={(val) =>
                    handleConsumableChange(val === "consumable")
                  }
                >
                  <SelectItem value="regular">רגיל</SelectItem>
                  <SelectItem value="consumable">מתכלה</SelectItem>
                </Select>
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  סטטוס פריט
                </Text>
                <div className="flex items-center gap-2 mt-1">
                  <Switch
                    checked={formState.is_active}
                    onChange={(val) => onChange("is_active", val)}
                    disabled={!canEdit}
                  />
                  <Text className="text-sm">פריט פעיל</Text>
                </div>
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  סימון מק״ט ייחודי
                </Text>
                <div className="flex items-center gap-2 mt-1">
                  <Switch
                    checked={formState.is_sku_tracked}
                    onChange={(val) => handleSkuTrackedChange(val)}
                    disabled={!canEdit}
                  />
                  <Text className="text-sm">מנוהל לפי מק״ט ייחודי</Text>
                </div>
              </div>
            </div>
            {formState.ownership_type === "rental" && (
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תוקף השכרה
                </Text>
                <TextInput
                  type="date"
                  disabled={!canEdit}
                  value={formState.rental_expiry}
                  onChange={(e) => onChange("rental_expiry", e.target.value)}
                />
              </div>
            )}
            {formState.is_consumable && (
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  מלאי מינימלי
                </Text>
                <TextInput
                  type="number"
                  disabled={!canEdit}
                  value={formState.min_stock}
                  onChange={(e) => onChange("min_stock", e.target.value)}
                />
              </div>
            )}
            <Text className="text-xs" style={{ color: cssVar.text.muted }}>
              בחירה ב"השכרה" מנטרלת אופציית מתכלה. ניתן להגדיר קונסיגנציה כמצב ביניים (מתועד בלבד).
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                קישור לתמונה / מסמך
              </Text>
              <TextInput
                type="url"
                disabled={!canEdit}
                value={formState.default_image_url}
                onChange={(e) => onChange("default_image_url", e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                className="mt-1 text-sm"
                disabled={!canEdit}
                onChange={handleImageFileChange}
              />
              <Text className="text-xs mt-1" style={{ color: cssVar.text.muted }}>
                ניתן להעלות קובץ עד 2MB או לספק קישור ישיר.
              </Text>
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                הערות
              </Text>
              <Textarea
                rows={3}
                disabled={!canEdit}
                value={formState.notes}
                onChange={(e) => onChange("notes", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: cssVar.border.primary }}>
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !canEdit}>
            {isSubmitting ? "שומר..." : editingItem ? "עדכן" : "צור פריט"}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
