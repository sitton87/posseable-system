"use client";

import { Button, Modal } from "@/app/components/ui";
import { colors, spacing } from "@/app/styles/foundations";
import { muted } from "../utils";

type DraftPromptModalProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  onDiscard: () => void;
  onSave: () => void;
};

export default function DraftPromptModal({
  open,
  onClose,
  onContinue,
  onDiscard,
  onSave,
}: DraftPromptModalProps) {
  return (
    <Modal open={open} onClose={onClose} width="min(420px, 90vw)">
      <h3 style={{ marginTop: 0 }}>לשמור את התורם כטיוטה?</h3>
      <p style={{ color: muted }}>
        הטיוטה תישמר עבורך בלבד ותאפשר לך לחזור בהמשך מבלי לאבד נתונים.
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: spacing.sm,
          marginTop: spacing.lg,
        }}
      >
        <Button variant="ghost" onClick={onContinue}>
          המשך לערוך
        </Button>
        <Button variant="secondary" onClick={onDiscard}>
          בטל
        </Button>
        <Button onClick={onSave}>שמור כטיוטה</Button>
      </div>
    </Modal>
  );
}

