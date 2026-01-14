import { useEffect, useCallback } from "react";
import {
  Title,
  Text,
  TextInput,
  Button,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { Section } from "@/app/components/shared";
import { cssVar } from "@/app/styles/design-system";
import { VolunteerFormState } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  formState: VolunteerFormState;
  onChange: <K extends keyof VolunteerFormState>(
    key: K,
    value: VolunteerFormState[K]
  ) => void;
  onSubmit: () => void;
  editing: boolean;
  draftPromptOpen: boolean;
};

export default function VolunteerFormModal({
  open,
  onClose,
  formState,
  onChange,
  onSubmit,
  editing,
  draftPromptOpen,
}: Props) {
  // Handle ESC key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !draftPromptOpen) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [open, onClose, draftPromptOpen]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-2xl">
        <Title className="mb-6">
          {editing ? "עריכת מתנדב" : "מתנדב חדש"}
        </Title>

        <div className="space-y-6">
          <Section title="פרטים אישיים">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  תעודת זהות <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <TextInput
                  value={formState.national_id}
                  onChange={(e) => onChange("national_id", e.target.value)}
                  disabled={!!editing}
                  maxLength={9}
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  שם מלא <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <TextInput
                  value={formState.full_name}
                  onChange={(e) => onChange("full_name", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  טלפון
                </Text>
                <TextInput
                  type="tel"
                  value={formState.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  אימייל
                </Text>
                <TextInput
                  type="email"
                  value={formState.email}
                  onChange={(e) => onChange("email", e.target.value)}
                />
              </div>
            </div>
          </Section>

          <Section title="כתובת">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  רחוב
                </Text>
                <TextInput
                  value={formState.street || ""}
                  onChange={(e) => onChange("street", e.target.value)}
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  מספר בית
                </Text>
                <TextInput
                  value={formState.house_number || ""}
                  onChange={(e) => onChange("house_number", e.target.value)}
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  עיר
                </Text>
                <TextInput
                  value={formState.city || ""}
                  onChange={(e) => onChange("city", e.target.value)}
                />
              </div>
            </div>
          </Section>

          <Section title="סיווג ופעילות">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  סוג <span style={{ color: cssVar.status.danger }}>*</span>
                </Text>
                <Select
                  value={formState.classification || "volunteer"}
                  onValueChange={(val) => onChange("classification", val)}
                >
                  <SelectItem value="volunteer">מתנדב</SelectItem>
                  <SelectItem value="staff">איש צוות</SelectItem>
                  <SelectItem value="management">הנהלה</SelectItem>
                </Select>
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  סוג מתנדב
                </Text>
                <Select
                  value={formState.volunteer_type || ""}
                  onValueChange={(val) => onChange("volunteer_type", val)}
                  placeholder="בחר..."
                >
                  <SelectItem value="">לא מוגדר</SelectItem>
                  <SelectItem value="water">מים</SelectItem>
                  <SelectItem value="media">מדיה</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  מקצוע
                </Text>
                <TextInput
                  value={formState.profession || ""}
                  onChange={(e) => onChange("profession", e.target.value)}
                />
              </div>
              <div>
                <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                  זמינות
                </Text>
                <TextInput
                  value={formState.availability || ""}
                  onChange={(e) => onChange("availability", e.target.value)}
                  placeholder="ימים ושעות זמינות"
                />
              </div>
            </div>
            <div className="mt-4">
              <Text className="text-sm mb-1" style={{ color: cssVar.text.secondary }}>
                הערות
              </Text>
              <Textarea
                value={formState.notes}
                onChange={(e) => onChange("notes", e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Switch
                checked={formState.active}
                onChange={(val) => onChange("active", val)}
              />
              <Text className="font-medium">מתנדב פעיל</Text>
            </div>
          </Section>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: cssVar.border.primary }}>
          <Button variant="secondary" onClick={onClose}>
            ביטול
          </Button>
          <Button onClick={onSubmit}>
            {editing ? "עדכון מתנדב" : "שמור מתנדב"}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
