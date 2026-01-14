"use client";

import type { CSSProperties, ReactNode } from "react";
import { useModalEsc } from "@/app/hooks/useModalEsc";
import { cssVar, numericValues } from "@/app/styles/design-system";

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "full";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  size?: ModalSize;
  width?: string | number;
  style?: CSSProperties;
  overlayStyle?: CSSProperties;
  children: ReactNode;
  escEnabled?: boolean;
  closeOnOverlayClick?: boolean;
};

const modalOverlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.5)",
  display: "grid",
  placeItems: "center",
  zIndex: numericValues.z.modal,
  padding: cssVar.spacing[6],
};

const modalCard: CSSProperties = {
  background: cssVar.bg.primary,
  borderRadius: cssVar.modal.radius,
  boxShadow: cssVar.modal.shadow,
  maxHeight: "90vh",
  overflowY: "auto",
  padding: cssVar.modal.padding,
};

const sizeWidths: Record<ModalSize, string | number> = {
  xs: numericValues.modal.xs,
  sm: numericValues.modal.sm,
  md: numericValues.modal.md,
  lg: numericValues.modal.lg,
  xl: numericValues.modal.xl,
  full: "calc(100vw - 2rem)",
};

export function Modal({
  open,
  onClose,
  size = "md",
  width,
  style,
  overlayStyle,
  children,
  escEnabled = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  useModalEsc({
    enabled: open && escEnabled && typeof onClose === "function",
    onClose: onClose ?? (() => {}),
  });

  if (!open) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  const modalWidth = width ?? sizeWidths[size];

  return (
    <div
      style={{ ...modalOverlay, ...overlayStyle }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          ...modalCard,
          width: modalWidth,
          maxWidth: "95vw",
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// Modal sub-components for structured layouts
export function ModalHeader({
  children,
  style,
  onClose,
}: {
  children: ReactNode;
  style?: CSSProperties;
  onClose?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: cssVar.spacing[4],
        paddingBottom: cssVar.spacing[3],
        borderBottom: `1px solid ${cssVar.border.primary}`,
        ...style,
      }}
    >
      <div className="text-lg font-semibold text-ds-text-primary">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-ds-text-muted hover:text-ds-text-primary transition-colors p-1 rounded-ds-sm hover:bg-ds-bg-hover"
          aria-label="סגור"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function ModalBody({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        marginBottom: cssVar.spacing[4],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  style,
  align = "end",
}: {
  children: ReactNode;
  style?: CSSProperties;
  align?: "start" | "center" | "end" | "between";
}) {
  const alignMap = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: alignMap[align],
        alignItems: "center",
        gap: cssVar.spacing[3],
        paddingTop: cssVar.spacing[3],
        borderTop: `1px solid ${cssVar.border.primary}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
