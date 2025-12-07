"use client";

import { useEffect } from "react";

type ModalEscOptions = {
  enabled?: boolean;
  onClose: () => void;
};

export function useModalEsc({ enabled = true, onClose }: ModalEscOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [enabled, onClose]);
}

