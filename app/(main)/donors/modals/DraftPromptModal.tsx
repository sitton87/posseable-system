"use client";

import { Title, Text, Button, Flex } from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";

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
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-md">
        <Title className="mb-2">לשמור את התורם כטיוטה?</Title>
        <Text style={{ color: cssVar.text.muted }} className="mb-6">
          הטיוטה תישמר עבורך בלבד ותאפשר לך לחזור בהמשך מבלי לאבד נתונים.
        </Text>
        <Flex justifyContent="end" className="gap-3">
          <Button variant="secondary" color="slate" onClick={onContinue}>
            המשך לערוך
          </Button>
          <Button variant="secondary" onClick={onDiscard}>
            בטל
          </Button>
          <Button onClick={onSave}>שמור כטיוטה</Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
