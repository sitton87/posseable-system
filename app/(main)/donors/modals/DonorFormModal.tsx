"use client";

import { Button, Modal } from "@/app/components/ui";
import { FormGrid, Section } from "@/app/components/shared";
import { inputStyle, labelStyle } from "@/app/styles/components";
import { colors, spacing } from "@/app/styles/foundations";
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
    <Modal
      open={open}
      onClose={onClose}
      width="min(640px, 95vw)"
      style={{ padding: spacing.xxl }}
      escEnabled={!draftPromptOpen}
    >
      <h3 style={{ margin: "0 0 16px", fontSize: 20 }}>
        {editing ? "עריכת תורם" : "תורם חדש"}
      </h3>
      <Section
        title="📋 פרטים אישיים"
        subtitle="מידע בסיסי על התורם"
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
              onChange={(e) => onInputChange("national_id", e.target.value)}
              disabled={editing}
            />
          </div>
          <div>
            <label style={labelStyle}>
              שם התורם <span style={{ color: colors.danger }}>*</span>
            </label>
            <input
              type="text"
              style={inputStyle}
              value={formState.full_name}
              onChange={(e) => onInputChange("full_name", e.target.value)}
            />
          </div>
        </FormGrid>
      </Section>

      <Section
        title="🏢 פרטי התקשרות"
        subtitle="איך ניתן להשיג את התורם"
        style={{ marginBottom: spacing.lg }}
        bodyStyle={{ gap: spacing.md }}
      >
        <div>
          <label style={labelStyle}>ארגון / חברה</label>
          <input
            type="text"
            style={inputStyle}
            value={formState.organization}
            onChange={(e) => onInputChange("organization", e.target.value)}
          />
        </div>
        <FormGrid
          columns="repeat(auto-fit, minmax(240px, 1fr))"
          gap={spacing.md}
        >
          <div>
            <label style={labelStyle}>טלפון</label>
            <input
              type="tel"
              style={inputStyle}
              value={formState.phone}
              onChange={(e) => onInputChange("phone", e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>אימייל</label>
            <input
              type="email"
              style={inputStyle}
              value={formState.email}
              onChange={(e) => onInputChange("email", e.target.value)}
            />
          </div>
        </FormGrid>
      </Section>

      <Section
        title="📝 הערות והעדפות"
        subtitle="תיעוד קצר ומשמעותי"
        style={{ marginBottom: spacing.lg }}
        bodyStyle={{ gap: spacing.sm }}
      >
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={formState.notes}
          onChange={(e) => onInputChange("notes", e.target.value)}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
            marginTop: spacing.sm,
          }}
        >
          <input
            type="checkbox"
            checked={formState.is_active}
            onChange={(e) => onInputChange("is_active", e.target.checked)}
            id="donor-active"
          />
          <label htmlFor="donor-active" style={{ fontWeight: 600 }}>
            תורם פעיל
          </label>
        </div>
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
          {editing ? "עדכון תורם" : "שמור תורם"}
        </Button>
      </div>
    </Modal>
  );
}



