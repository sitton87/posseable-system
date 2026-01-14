"use client";

import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Flex,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";
import { DonorFormState } from "../types";

type DonorFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formState: DonorFormState;
  onInputChange: <K extends keyof DonorFormState>(
    key: K,
    value: DonorFormState[K]
  ) => void;
  editing: boolean;
  draftPromptOpen: boolean;
};

export default function DonorFormModal({
  open,
  onClose,
  onSubmit,
  formState,
  onInputChange,
  editing,
  draftPromptOpen,
}: DonorFormModalProps) {
  return (
    <Dialog open={open} onClose={onClose} static={draftPromptOpen}>
      <DialogPanel className="max-w-2xl">
        <Title className="mb-6">
          {editing ? "עריכת תורם" : "תורם חדש"}
        </Title>

        {/* פרטים אישיים */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span>📋</span>
            <div>
              <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                פרטים אישיים
              </Text>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                מידע בסיסי על התורם
              </Text>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                תעודת זהות <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <TextInput
                type="text"
                maxLength={9}
                value={formState.national_id}
                onChange={(e) => onInputChange("national_id", e.target.value)}
                disabled={editing}
                placeholder="123456789"
              />
            </div>
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                שם התורם <span style={{ color: cssVar.status.danger }}>*</span>
              </Text>
              <TextInput
                type="text"
                value={formState.full_name}
                onChange={(e) => onInputChange("full_name", e.target.value)}
                placeholder="שם מלא"
              />
            </div>
          </div>
        </Card>

        {/* פרטי התקשרות */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span>🏢</span>
            <div>
              <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                פרטי התקשרות
              </Text>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                איך ניתן להשיג את התורם
              </Text>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                ארגון / חברה
              </Text>
              <TextInput
                type="text"
                value={formState.organization}
                onChange={(e) => onInputChange("organization", e.target.value)}
                placeholder="שם הארגון"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  טלפון
                </Text>
                <TextInput
                  type="tel"
                  value={formState.phone}
                  onChange={(e) => onInputChange("phone", e.target.value)}
                  placeholder="050-0000000"
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  אימייל
                </Text>
                <TextInput
                  type="email"
                  value={formState.email}
                  onChange={(e) => onInputChange("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* הערות והעדפות */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span>📝</span>
            <div>
              <Text className="font-semibold" style={{ color: cssVar.text.primary }}>
                הערות והעדפות
              </Text>
              <Text className="text-xs" style={{ color: cssVar.text.muted }}>
                תיעוד קצר ומשמעותי
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
            value={formState.notes}
            onChange={(e) => onInputChange("notes", e.target.value)}
            placeholder="הערות נוספות..."
          />
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={formState.is_active}
              onChange={(e) => onInputChange("is_active", e.target.checked)}
              id="donor-active"
              className="w-4 h-4"
            />
            <label htmlFor="donor-active" className="font-semibold text-sm">
              תורם פעיל
            </label>
          </div>
        </Card>

        {/* Actions */}
        <Flex justifyContent="end" className="gap-3">
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={onSubmit}>
            {editing ? "עדכון תורם" : "שמור תורם"}
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
