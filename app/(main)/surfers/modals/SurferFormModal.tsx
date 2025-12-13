import { Button, Modal } from "@/app/components/ui";
import { FormGrid, Section, SmallActionButton, sectionCardStyle } from "@/app/components/shared";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
import { GENDER_OPTIONS, PROGRAM_OPTIONS, STATUS_OPTIONS } from "@/type";
import { SurferFormState } from "../types";

const muted = colors.textMuted;

const sectionStyle = {
  ...sectionCardStyle,
  marginBottom: spacing.lg,
};

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
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(960px, 95vw)"
      style={{ padding: spacing.lg }}
      overlayStyle={{ padding: `${spacing.xl}px 0` }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>{editing ? "עריכת גולש" : "גולש חדש"}</h3>
          <SmallActionButton variant="secondary" onClick={onClose}>
            ✕ סגור
          </SmallActionButton>
        </div>

        <Section
          title="📋 פרטים אישיים"
          subtitle="מידע בסיסי על הגולש"
          style={{ marginBottom: spacing.lg }}
        >
          <FormGrid
            columns="repeat(auto-fit, minmax(240px, 1fr))"
            gap={spacing.sm}
          >
            <div>
              <label style={labelStyle}>
                תעודת זהות <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                style={inputStyle}
                value={formState.national_id}
                onChange={(e) => onChange("national_id", e.target.value)}
                disabled={editing}
                maxLength={9}
                placeholder="9 ספרות"
              />
            </div>
            <div>
              <label style={labelStyle}>
                שם מלא <span style={{ color: colors.danger }}>*</span>
              </label>
              <input
                style={inputStyle}
                value={formState.full_name}
                onChange={(e) => onChange("full_name", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>טלפון</label>
              <input
                style={inputStyle}
                value={formState.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>אימייל</label>
              <input
                style={inputStyle}
                type="email"
                value={formState.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>מקום מגורים</label>
              <input
                style={inputStyle}
                value={formState.residence}
                onChange={(e) => onChange("residence", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>תאריך לידה</label>
              <input
                style={inputStyle}
                type="date"
                value={formState.date_of_birth}
                onChange={(e) => onChange("date_of_birth", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>מגדר</label>
              <select
                style={inputStyle}
                value={formState.gender}
                onChange={(e) => onChange("gender", e.target.value)}
              >
                <option value="">בחר...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </FormGrid>
        </Section>

        <div style={sectionStyle}>
          <h4 style={{ margin: "0 0 12px 0", color: muted }}>
            🎯 תוכנית וסטטוס
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: spacing.sm,
            }}
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
              <label style={labelStyle}>קבוצה</label>
              <select
                style={inputStyle}
                value={formState.group_id}
                onChange={(e) => onChange("group_id", e.target.value)}
              >
                <option value="">
                  {groupsLoading ? "טוען קבוצות..." : "לא שויכה"}
                </option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>מספר מתנדבים נדרש</label>
              <input
                style={inputStyle}
                type="number"
                value={formState.volunteers_needed}
                onChange={(e) => onChange("volunteers_needed", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h4 style={{ margin: "0 0 12px 0", color: muted }}>🏥 מצב רפואי</h4>
          <div style={{ display: "flex", gap: spacing.lg, flexWrap: "wrap" }}>
            <label
              style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
            >
              <input
                type="checkbox"
                checked={formState.medical_approval}
                onChange={(e) => onChange("medical_approval", e.target.checked)}
              />
              אישור רפואי קיים
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: spacing.xs }}
            >
              <input
                type="checkbox"
                checked={formState.needs_wheelchair}
                onChange={(e) => onChange("needs_wheelchair", e.target.checked)}
              />
              זקוק לכיסא גלגלים
            </label>
          </div>
          <div style={{ marginTop: spacing.sm }}>
            <label style={labelStyle}>מצב רפואי / הערות</label>
            <textarea
              style={{ ...inputStyle, minHeight: 70 }}
              value={formState.medical_condition}
              onChange={(e) => onChange("medical_condition", e.target.value)}
            />
          </div>
        </div>

        <div style={sectionStyle}>
          <h4 style={{ margin: "0 0 12px 0", color: muted }}>
            🚨 איש קשר לחירום
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: spacing.sm,
            }}
          >
            <div>
              <label style={labelStyle}>שם איש קשר</label>
              <input
                style={inputStyle}
                value={formState.emergency_contact_name}
                onChange={(e) =>
                  onChange("emergency_contact_name", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>טלפון</label>
              <input
                style={inputStyle}
                value={formState.emergency_contact_phone}
                onChange={(e) =>
                  onChange("emergency_contact_phone", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h4 style={{ margin: "0 0 12px 0", color: muted }}>
            📝 דרישות והערות
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: spacing.sm,
            }}
          >
            <div>
              <label style={labelStyle}>דרישות מיוחדות</label>
              <textarea
                style={{ ...inputStyle, minHeight: 70 }}
                value={formState.special_requirements}
                onChange={(e) =>
                  onChange("special_requirements", e.target.value)
                }
              />
            </div>
            <div>
              <label style={labelStyle}>הערות</label>
              <textarea
                style={{ ...inputStyle, minHeight: 70 }}
                value={formState.notes}
                onChange={(e) => onChange("notes", e.target.value)}
              />
            </div>
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
          <Button onClick={onSubmit}>{editing ? "עדכון" : "שמור"}</Button>
        </div>
      </div>
    </Modal>
  );
}

