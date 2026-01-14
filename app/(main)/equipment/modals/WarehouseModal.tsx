"use client";

import {
  Title,
  Text,
  TextInput,
  Textarea,
  Button,
  Switch,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
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
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-3xl">
        <Title className="mb-6">
          {isEditing ? "עריכת מחסן" : "מחסן חדש"}
        </Title>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              {isEditing ? (
                <>
                  <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                    קוד מחסן
                  </Text>
                  <TextInput
                    value={form.code}
                    disabled
                  />
                </>
              ) : (
                <Text className="text-sm" style={{ color: cssVar.text.muted }}>
                  קוד המחסן ייווצר אוטומטית בעת השמירה.
                </Text>
              )}
            </div>
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
                עיר
              </Text>
              <TextInput
                value={form.city}
                onChange={(e) => onChange("city", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                כתובת
              </Text>
              <TextInput
                value={form.address_line}
                onChange={(e) => onChange("address_line", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                מיקוד
              </Text>
              <TextInput
                value={form.postal_code}
                onChange={(e) => onChange("postal_code", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                מנהל המחסן
              </Text>
              <TextInput
                value={form.manager_name}
                onChange={(e) => onChange("manager_name", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                טלפון מנהל
              </Text>
              <TextInput
                type="tel"
                placeholder="050-1234567"
                value={form.manager_phone}
                onChange={(e) => onChange("manager_phone", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                אימייל מנהל
              </Text>
              <TextInput
                type="email"
                value={form.manager_email}
                onChange={(e) => onChange("manager_email", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                איש קשר נוסף
              </Text>
              <TextInput
                value={form.contact_name}
                onChange={(e) => onChange("contact_name", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                טלפון איש קשר
              </Text>
              <TextInput
                type="tel"
                placeholder="050-1234567"
                value={form.contact_phone}
                onChange={(e) => onChange("contact_phone", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                עלות שכירות (חודשי)
              </Text>
              <TextInput
                type="number"
                value={form.rent_cost}
                onChange={(e) => onChange("rent_cost", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                מטבע
              </Text>
              <TextInput
                maxLength={3}
                value={form.rent_currency}
                onChange={(e) =>
                  onChange("rent_currency", e.target.value.toUpperCase())
                }
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                תום חוזה שכירות
              </Text>
              <input
                type="date"
                value={form.rent_expiry}
                onChange={(e) => onChange("rent_expiry", e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={{ 
                  borderColor: cssVar.border.primary, 
                  backgroundColor: cssVar.bg.primary,
                  color: cssVar.text.primary 
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                הערות חוזה / מסמכים
              </Text>
              <Textarea
                rows={3}
                value={form.lease_notes}
                onChange={(e) => onChange("lease_notes", e.target.value)}
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                הערות כלליות
              </Text>
              <Textarea
                rows={3}
                value={form.general_notes}
                onChange={(e) => onChange("general_notes", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onChange={(val) => onChange("is_active", val)}
            />
            <Text className="text-sm">מחסן פעיל</Text>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: cssVar.border.primary }}>
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "שומר..." : isEditing ? "עדכן מחסן" : "שמור מחסן"}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
