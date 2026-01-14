"use client";

import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Flex,
  Select,
  SelectItem,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
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
    <Dialog open={open} onClose={onClose} static={!escEnabled}>
      <DialogPanel className="max-w-2xl">
        <Title className="mb-6">
          {editing ? "עריכת ספק" : "ספק חדש"}
        </Title>

        {/* מזהה וסיווג */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              מספר ספק <span style={{ color: cssVar.status.danger }}>*</span>
            </Text>
            <TextInput
              type="text"
              value={formData.supplier_identifier}
              onChange={(e) =>
                onChange((prev) => ({
                  ...prev,
                  supplier_identifier: e.target.value.toUpperCase(),
                }))
              }
              disabled={editing}
              maxLength={20}
              placeholder="מזהה ספק"
            />
          </div>
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              סוג מזהה
            </Text>
            <Select
              value={formData.identifier_type}
              onValueChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  identifier_type: val as IdentifierType,
                }))
              }
            >
              {identifierTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
              סוג ספק
            </Text>
            <Select
              value={formData.supplier_type}
              onValueChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  supplier_type: val as SupplierType,
                }))
              }
            >
              {supplierTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {/* פרטי ספק */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span>📋</span>
            <div>
              <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                פרטי ספק
              </Text>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                שם וסיווג ראשוני
              </Text>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שם הספק <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <TextInput
                type="text"
                value={formData.name}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="שם הספק"
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שירותים / תחומי התמחות
              </Text>
              <textarea
                className="w-full min-h-[80px] p-3 border rounded-lg resize-y text-sm"
                style={{
                  borderColor: cssVar.border.primary,
                  backgroundColor: cssVar.bg.primary,
                  color: cssVar.text.primary,
                }}
                value={formData.services_offered}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    services_offered: e.target.value,
                  }))
                }
                placeholder="תחומי התמחות..."
              />
            </div>
          </div>
        </Card>

        {/* פרטי קשר */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span>📞</span>
            <div>
              <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                פרטי קשר
              </Text>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                איש קשר וערוצים
              </Text>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                איש קשר
              </Text>
              <TextInput
                type="text"
                value={formData.contact_name}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    contact_name: e.target.value,
                  }))
                }
                placeholder="שם איש קשר"
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                טלפון
              </Text>
              <TextInput
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="050-0000000"
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                אימייל
              </Text>
              <TextInput
                type="email"
                value={formData.email}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@example.com"
              />
            </div>
          </div>
        </Card>

        {/* הערות */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span>📝</span>
            <div>
              <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                הערות
              </Text>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                רקע נוסף
              </Text>
            </div>
          </div>
          <textarea
            className="w-full min-h-[80px] p-3 border rounded-lg resize-y text-sm"
            style={{
              borderColor: cssVar.border.primary,
              backgroundColor: cssVar.bg.primary,
              color: cssVar.text.primary,
            }}
            value={formData.notes}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="הערות נוספות..."
          />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.has_active_contract}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    has_active_contract: e.target.checked,
                  }))
                }
                id="has-contract"
                className="w-4 h-4"
              />
              <label htmlFor="has-contract" className="font-semibold text-sm">
                חוזה פעיל
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                id="is-active"
                className="w-4 h-4"
              />
              <label htmlFor="is-active" className="font-semibold text-sm">
                ספק פעיל
              </label>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Flex justifyContent="end" className="gap-3">
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={onSubmit}>
            {editing ? "עדכון" : "שמור"}
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
