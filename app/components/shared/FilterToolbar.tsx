"use client";

import type { CSSProperties, ReactNode } from "react";
import { numericValues } from "@/app/styles/design-system";

type FilterToolbarProps = {
  children: ReactNode;
  columns?: string;
  gap?: number;
  style?: CSSProperties;
  className?: string;
};

export function FilterToolbar({
  children,
  columns = "repeat(auto-fit, minmax(200px, 1fr))",
  gap = numericValues.spacing[4],
  style,
  className,
}: FilterToolbarProps) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: columns,
        gap,
        width: "100%",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
