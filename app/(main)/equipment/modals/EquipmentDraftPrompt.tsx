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

export default function EquipmentDraftPrompt({
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
        <h3 style={{ marginTop: 0 }}>לשמור את הפריט כטיוטה?</h3>
        <p style={{ color: muted }}>
          ניתן לשמור את הפריט כטיוטה אישית (מוצגת רק לך) ולהמשיך לעבוד עליו
          מאוחר יותר או לבטל את הפעולה כעת.
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

