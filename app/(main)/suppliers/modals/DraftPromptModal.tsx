"use client";

import { Title, Text, Button, Flex } from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";

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
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-md">
        <Title className="mb-2">לשמור את הספק כטיוטה?</Title>
        <Text style={{ color: cssVar.text.muted }} className="mb-6">
          ניתן לשמור את הערכים כטיוטה אישית ולהמשיך לערוך במועד מאוחר יותר.
        </Text>
        <Flex justifyContent="end" className="gap-3">
          <Button variant="secondary" color="slate" onClick={onClose}>
            חזרה לעריכה
          </Button>
          <Button variant="secondary" onClick={onDiscard}>
            בטל וסגור
          </Button>
          <Button onClick={onSaveDraft}>שמור כטיוטה</Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}
