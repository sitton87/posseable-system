import { Modal, Button } from "@/app/components/ui";
import { spacing, colors } from "@/app/styles/foundations";

const muted = colors.textMuted;

type Props = {
  open: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
};

export default function DraftPromptModal({
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
      <h3 style={{ marginTop: 0 }}>לשמור את הספק כטיוטה?</h3>
      <p style={{ color: muted }}>
        ניתן לשמור את הערכים כטיוטה אישית ולהמשיך לערוך במועד מאוחר יותר.
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: spacing.sm,
          marginTop: spacing.lg,
        }}
      >
        <Button variant="ghost" onClick={onClose}>
          חזרה לעריכה
        </Button>
        <Button variant="secondary" onClick={onDiscard}>
          בטל וסגור
        </Button>
        <Button onClick={onSaveDraft}>שמור כטיוטה</Button>
      </div>
    </Modal>
  );
}

