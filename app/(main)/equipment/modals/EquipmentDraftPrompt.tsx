import {
  Title,
  Text,
  Button,
} from "@tremor/react";
import { Dialog, DialogPanel } from "@tremor/react";
import { cssVar } from "@/app/styles/design-system";

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
    <Dialog open={open} onClose={onClose}>
      <DialogPanel className="max-w-sm">
        <Title className="mb-2">לשמור את הפריט כטיוטה?</Title>
        <Text className="mb-6">
          ניתן לשמור את הפריט כטיוטה אישית (מוצגת רק לך) ולהמשיך לעבוד עליו
          מאוחר יותר או לבטל את הפעולה כעת.
        </Text>

        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: cssVar.border.primary }}>
          <Button variant="light" size="sm" onClick={onClose}>
            חזרה לעריכה
          </Button>
          <Button variant="secondary" size="sm" onClick={onDiscard}>
            בטל וסגור
          </Button>
          <Button size="sm" onClick={onSaveDraft}>
            שמור כטיוטה
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
