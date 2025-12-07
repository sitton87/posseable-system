import type { CSSProperties, ReactNode } from "react";
import { useModalEsc } from "@/app/hooks/useModalEsc";
import { modalOverlay, modalCard } from "@/app/styles/components";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  width?: string | number;
  style?: CSSProperties;
  overlayStyle?: CSSProperties;
  children: ReactNode;
  escEnabled?: boolean;
};

export function Modal({
  open,
  onClose,
  width,
  style,
  overlayStyle,
  children,
  escEnabled = true,
}: ModalProps) {
  useModalEsc({
    enabled: open && escEnabled && typeof onClose === "function",
    onClose: onClose ?? (() => {}),
  });

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

