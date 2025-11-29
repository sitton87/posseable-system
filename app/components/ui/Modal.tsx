import type { CSSProperties, ReactNode } from "react";
import { modalOverlay, modalCard } from "@/app/styles/components";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  width?: string | number;
  style?: CSSProperties;
  overlayStyle?: CSSProperties;
  children: ReactNode;
};

export function Modal({
  open,
  onClose,
  width,
  style,
  overlayStyle,
  children,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{ ...modalOverlay, ...overlayStyle }}
      onClick={() => onClose?.()}
    >
      <div
        style={{
          ...modalCard,
          width: width ?? modalCard.width,
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

