import { Button, Modal } from "@/app/components/ui";
import { FormGrid, Section } from "@/app/components/shared";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import { PROGRAM_OPTIONS, STATUS_OPTIONS } from "@/type";
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
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(640px, 95vw)"
      style={{ padding: spacing.xxl }}
      escEnabled={!draftPromptOpen}
    >
      <h3 style={{ margin: "0 0 16px", fontSize: 20 }}>
        {editing ? "עריכת מתנדב" : "מתנדב חדש"}
      </h3>
      <Section
        title="פרטים אישיים"
        style={{ marginBottom: spacing.lg }}
        bodyStyle={{ gap: spacing.md }}
      >
        <FormGrid
          columns="repeat(auto-fit, minmax(240px, 1fr))"
          gap={spacing.md}
        >
          <div>
            <label style={labelStyle}>
              תעודת זהות <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              maxLength={9}
              style={inputStyle}
              value={formState.national_id}
              onChange={(e) => onChange("national_id", e.target.value)}
              disabled={!!editing}
            />
          </div>
          <div>
            <label style={labelStyle}>
              שם מלא <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formState.full_name}
              onChange={(e) => onChange("full_name", e.target.value)}
            />
          </div>
        </FormGrid>
        <FormGrid
          columns="repeat(auto-fit, minmax(220px, 1fr))"
          gap={spacing.md}
        >
          <div>
            <label style={labelStyle}>טלפון</label>
            <input
              type="tel"
              style={inputStyle}
              value={formState.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>אימייל</label>
            <input
              type="email"
              style={inputStyle}
              value={formState.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
          </div>
        </FormGrid>
      </Section>

      <Section
        title="שיוך וסטטוס"
        style={{ marginBottom: spacing.lg }}
        bodyStyle={{ gap: spacing.md }}
      >
        <FormGrid
          columns="repeat(auto-fit, minmax(220px, 1fr))"
          gap={spacing.md}
        >
          <div>
            <label style={labelStyle}>תוכנית</label>
            <select
              style={inputStyle}
              value={formState.program}
              onChange={(e) => onChange("program", e.target.value)}
            >
              <option value="">בחר...</option>
              {PROGRAM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>סטטוס</label>
            <select
              style={inputStyle}
              value={formState.status}
              onChange={(e) => onChange("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>סוג</label>
            <select
              style={inputStyle}
              value={formState.classification}
              onChange={(e) => onChange("classification", e.target.value)}
            >
              <option value="volunteer">מתנדב</option>
              <option value="staff">איש צוות</option>
              <option value="management">הנהלה</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>קבוצה</label>
            <input
              style={inputStyle}
              value={formState.group_id}
              onChange={(e) => onChange("group_id", e.target.value)}
              placeholder="מזהה קבוצה (אם קיים)"
            />
          </div>
        </FormGrid>
        <div>
          <label style={labelStyle}>הערות</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={formState.notes}
            onChange={(e) => onChange("notes", e.target.value)}
          />
        </div>
        <label
          style={{ display: "flex", alignItems: "center", gap: spacing.sm }}
        >
          <input
            type="checkbox"
            checked={formState.active}
            onChange={(e) => onChange("active", e.target.checked)}
          />
          מתנדב פעיל
        </label>
      </Section>

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
        <Button onClick={onSubmit}>
          {editing ? "עדכון מתנדב" : "שמור מתנדב"}
        </Button>
      </div>
    </Modal>
  );
}
