import { Modal, Button } from "@/app/components/ui";
import { SmallActionButton, sectionCardStyle } from "@/app/components/shared";
import { spacing, colors } from "@/app/styles/foundations";

const muted = colors.textMuted;

type Props = {
  open: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
};

export default function DocumentDraftPrompt({
  open,
  onClose,
  onSaveDraft,
  onDiscard,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="min(420px, 90vw)"
    >
      <div style={{ ...sectionCardStyle, boxShadow: "none" }}>
        <h3 style={{ marginTop: 0 }}>לשמור את התעודה כטיוטה?</h3>
        <p style={{ color: muted }}>
          השמירה תשמור את מצב התעודה רק עבורך. ניתן גם לסגור ללא שמירה או לחזור
          לעריכה.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
            marginTop: spacing.lg,
          }}
        >
          <SmallActionButton variant="ghost" onClick={onClose}>
            חזרה לעריכה
          </SmallActionButton>
          <SmallActionButton variant="secondary" onClick={onDiscard}>
            בטל וסגור
          </SmallActionButton>
          <SmallActionButton onClick={onSaveDraft}>
            שמור כטיוטה
          </SmallActionButton>
        </div>
      </div>
    </Modal>
  );
}

