"use client";

import {
  Title,
  Text,
  Button,
  Flex,
} from "@tremor/react";
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
    <Dialog open={open} onClose={onClose} className="z-[200]">
      <DialogPanel className="max-w-sm" dir="rtl">
        <Flex justifyContent="start" alignItems="center" className="gap-3 mb-4">
          <Title style={{ color: cssVar.text.primary }}>לשמור כטיוטה?</Title>
          <span className="text-xl font-light" style={{ color: cssVar.border.primary }}>|</span>
          <Text style={{ color: cssVar.text.muted }}>שמירת נתונים לפני סגירה</Text>
        </Flex>
        
        <Text className="mb-6" style={{ color: cssVar.text.secondary }}>
          ניתן לשמור את הנתונים כטיוטה אישית ולהמשיך מאוחר יותר או לסגור ללא שמירה.
        </Text>

        <div className="flex justify-start gap-3 pt-4 border-t" style={{ borderColor: cssVar.border.primary }}>
          <Button onClick={onSaveDraft}>
            שמור כטיוטה
          </Button>
          <Button variant="secondary" onClick={onDiscard}>
            בטל וסגור
          </Button>
          <Button variant="light" onClick={onClose}>
            חזרה לעריכה
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
