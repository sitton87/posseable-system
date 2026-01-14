import { useEffect, useCallback } from "react";
import {
  Button,
  Dialog,
  DialogPanel,
  TextInput,
  Select,
  SelectItem,
  Textarea,
  Title,
  Text,
  Grid,
  Col,
  Divider,
  Switch,
} from "@tremor/react";
import { GENDER_OPTIONS, PROGRAM_OPTIONS, STATUS_OPTIONS } from "@/type";
import { SurferFormState } from "../types";
import {
  XMarkIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  PhoneIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { cssVar, tw } from "@/app/styles/design-system";

type Props = {
  open: boolean;
  onClose: () => void;
  formState: SurferFormState;
  onChange: <K extends keyof SurferFormState>(
    key: K,
    value: SurferFormState[K]
  ) => void;
  onSubmit: () => void;
  editing: boolean;
  groups: { id: string; name: string }[];
  groupsLoading: boolean;
};

export default function SurferFormModal({
  open,
  onClose,
  formState,
  onChange,
  onSubmit,
  editing,
  groups,
  groupsLoading,
}: Props) {
  // Handle ESC key press - use capture phase to intercept before Dialog handles it
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown, { capture: true });
      return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
    }
  }, [open, handleKeyDown]);

  return (
    <Dialog open={open} onClose={() => {}} static={true} className="z-[100]">
      <DialogPanel
        className="max-w-4xl w-full p-0 overflow-hidden rounded-ds-modal-radius"
        style={{
          background: cssVar.modal.bg,
          boxShadow: cssVar.modal.shadow,
          border: `1px solid ${cssVar.border.primary}`,
        }}
        dir="rtl"
      >
        {/* Header */}
        <div
          className="flex justify-between items-center px-6 py-4"
          style={{
            borderBottom: `1px solid ${cssVar.border.primary}`,
            background: cssVar.bg.secondary,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: cssVar.brand.muted }}
            >
              <UserIcon className="w-5 h-5" style={{ color: cssVar.brand.primary }} />
            </div>
            <div>
              <Title style={{ color: cssVar.text.primary }} className="text-xl">
                {editing ? "עריכת גולש" : "גולש חדש"}
              </Title>
              <Text style={{ color: cssVar.text.muted }} className="text-sm">
                {editing ? "עדכון פרטי הגולש במערכת" : "הוספת גולש חדש למערכת"}
              </Text>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: cssVar.text.muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cssVar.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="p-6 max-h-[75vh] overflow-y-auto space-y-6"
          style={{ background: cssVar.modal.bg }}
        >
          {/* Personal Info */}
          <FormSection title="פרטים אישיים" icon={UserIcon} iconColor="brand">
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4">
              <FormField label="תעודת זהות" required>
                <TextInput
                  value={formState.national_id}
                  onChange={(e) => onChange("national_id", e.target.value)}
                  disabled={editing}
                  maxLength={9}
                  placeholder="9 ספרות"
                  error={formState.national_id.length > 0 && formState.national_id.length !== 9}
                  errorMessage="ת.ז חייבת להכיל 9 ספרות"
                />
              </FormField>
              <FormField label="שם מלא" required>
                <TextInput
                  value={formState.full_name}
                  onChange={(e) => onChange("full_name", e.target.value)}
                  placeholder="שם פרטי ושם משפחה"
                />
              </FormField>
              <FormField label="טלפון">
                <TextInput
                  value={formState.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="050-0000000"
                />
              </FormField>
              <FormField label="אימייל">
                <TextInput
                  type="email"
                  value={formState.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="example@mail.com"
                />
              </FormField>
              <FormField label="מקום מגורים">
                <TextInput
                  value={formState.residence}
                  onChange={(e) => onChange("residence", e.target.value)}
                  placeholder="עיר/יישוב"
                />
              </FormField>
              <FormField label="תאריך לידה">
                <input
                  type="date"
                  className={tw.input.base}
                  style={{
                    height: "38px",
                    background: cssVar.bg.primary,
                    color: cssVar.text.primary,
                  }}
                  value={formState.date_of_birth}
                  onChange={(e) => onChange("date_of_birth", e.target.value)}
                />
              </FormField>
              <FormField label="מגדר">
                <Select
                  value={formState.gender}
                  onValueChange={(val) => onChange("gender", val)}
                  placeholder="בחר מגדר"
                >
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </Select>
              </FormField>
            </Grid>
          </FormSection>

          {/* Status & Program */}
          <FormSection title="תוכנית וסטטוס" icon={ClipboardDocumentListIcon} iconColor="info">
            <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
              <FormField label="תוכנית">
                <Select
                  value={formState.program}
                  onValueChange={(val) => onChange("program", val)}
                  placeholder="בחר תוכנית"
                >
                  {PROGRAM_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </Select>
              </FormField>
              <FormField label="סטטוס">
                <Select
                  value={formState.status}
                  onValueChange={(val) => onChange("status", val)}
                  placeholder="בחר סטטוס"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </Select>
              </FormField>
              <FormField label="קבוצה">
                <Select
                  value={formState.group_id}
                  onValueChange={(val) => onChange("group_id", val)}
                  placeholder={groupsLoading ? "טוען קבוצות..." : "לא שויכה"}
                  disabled={groupsLoading}
                >
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </Select>
              </FormField>
              <FormField label="מתנדבים נדרשים">
                <TextInput
                  type="number"
                  value={formState.volunteers_needed}
                  onChange={(e) => onChange("volunteers_needed", e.target.value)}
                  placeholder="מספר"
                />
              </FormField>
            </Grid>
          </FormSection>

          {/* Medical Info */}
          <FormSection title="מצב רפואי" icon={HeartIcon} iconColor="danger">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                <label
                  className="flex items-center gap-3 cursor-pointer group px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: cssVar.bg.secondary,
                    border: `1px solid ${cssVar.border.primary}`,
                  }}
                >
                  <Switch
                    checked={formState.medical_approval}
                    onChange={(val) => onChange("medical_approval", val)}
                    color="emerald"
                  />
                  <span className="text-sm font-medium" style={{ color: cssVar.text.secondary }}>
                    אישור רפואי קיים
                  </span>
                </label>

                <label
                  className="flex items-center gap-3 cursor-pointer group px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: cssVar.bg.secondary,
                    border: `1px solid ${cssVar.border.primary}`,
                  }}
                >
                  <Switch
                    checked={formState.needs_wheelchair}
                    onChange={(val) => onChange("needs_wheelchair", val)}
                    color="blue"
                  />
                  <span className="text-sm font-medium" style={{ color: cssVar.text.secondary }}>
                    זקוק לכיסא גלגלים
                  </span>
                </label>
              </div>

              <FormField label="מצב רפואי / הערות">
                <Textarea
                  value={formState.medical_condition}
                  onChange={(e) => onChange("medical_condition", e.target.value)}
                  placeholder="פירוט מגבלות רפואיות..."
                  className="min-h-[80px]"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Emergency Contact */}
          <FormSection title="איש קשר לחירום" icon={PhoneIcon} iconColor="warning">
            <Grid numItems={1} numItemsSm={2} className="gap-4">
              <FormField label="שם איש קשר">
                <TextInput
                  value={formState.emergency_contact_name}
                  onChange={(e) => onChange("emergency_contact_name", e.target.value)}
                  placeholder="שם מלא"
                />
              </FormField>
              <FormField label="טלפון לחירום">
                <TextInput
                  value={formState.emergency_contact_phone}
                  onChange={(e) => onChange("emergency_contact_phone", e.target.value)}
                  placeholder="050-0000000"
                />
              </FormField>
            </Grid>
          </FormSection>

          {/* Requirements & Notes */}
          <FormSection title="הערות נוספות" icon={DocumentTextIcon} iconColor="neutral">
            <Grid numItems={1} numItemsSm={2} className="gap-4">
              <FormField label="דרישות מיוחדות">
                <Textarea
                  value={formState.special_requirements}
                  onChange={(e) => onChange("special_requirements", e.target.value)}
                  placeholder="דגשים מיוחדים לצוות..."
                  className="min-h-[80px]"
                />
              </FormField>
              <FormField label="הערות כלליות">
                <Textarea
                  value={formState.notes}
                  onChange={(e) => onChange("notes", e.target.value)}
                  placeholder="הערות מנהל..."
                  className="min-h-[80px]"
                />
              </FormField>
            </Grid>
          </FormSection>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-6 py-4"
          style={{
            background: cssVar.bg.secondary,
            borderTop: `1px solid ${cssVar.border.primary}`,
          }}
        >
          <Button type="button" variant="secondary" color="slate" onClick={onClose}>
            ביטול
          </Button>
          <Button type="button" variant="primary" color="blue" onClick={onSubmit}>
            {editing ? "עדכן פרטים" : "שמור גולש"}
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

// Form Section Component
function FormSection({
  title,
  icon: IconComponent,
  iconColor = "brand",
  children,
}: {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: "brand" | "info" | "danger" | "warning" | "neutral" | "success";
  children: React.ReactNode;
}) {
  const colorMap = {
    brand: cssVar.brand.primary,
    info: cssVar.status.info,
    danger: cssVar.status.danger,
    warning: cssVar.status.warning,
    neutral: cssVar.text.muted,
    success: cssVar.status.success,
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <IconComponent className="w-4 h-4" style={{ color: colorMap[iconColor] }} />
        <Text
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: cssVar.text.secondary }}
        >
          {title}
        </Text>
      </div>
      <Divider className="my-2" />
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Form Field Component
function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Text
        className="mb-1.5 text-sm font-medium block"
        style={{ color: cssVar.text.secondary }}
      >
        {label}
        {required && <span style={{ color: cssVar.status.danger }} className="mr-1">*</span>}
      </Text>
      {children}
    </div>
  );
}
