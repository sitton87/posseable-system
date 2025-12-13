import { Button, Modal } from "@/app/components/ui";
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
      width={400}
      style={{ padding: spacing.lg }}
    >
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
      >
        <h4 style={{ margin: 0 }}>לשמור כטיוטה?</h4>
        <div style={{ color: muted, fontSize: 14 }}>
          זיהינו שינויים שלא נשמרו. האם לשמור כטיוטה לפני סגירה?
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
          }}
        >
          <Button variant="secondary" onClick={onDiscard}>
            סגור בלי לשמור
          </Button>
          <Button onClick={onSaveDraft}>שמור טיוטה וסגור</Button>
        </div>
      </div>
    </Modal>
  );
}

