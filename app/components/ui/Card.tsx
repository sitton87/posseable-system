"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cssVar, card as cardPresets } from "@/app/styles/design-system";

type CardVariant = "default" | "interactive" | "selected" | "disabled";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: "sm" | "md" | "lg" | "none";
  style?: CSSProperties;
  children: ReactNode;
};

const paddingStyles: Record<"sm" | "md" | "lg" | "none", CSSProperties> = {
  none: { padding: 0 },
  sm: { padding: cssVar.card.paddingSm },
  md: { padding: cssVar.card.padding },
  lg: { padding: cssVar.card.paddingLg },
};

const baseStyle: CSSProperties = {
  background: cssVar.card.bg,
  borderRadius: cssVar.card.radius,
  border: `1px solid ${cssVar.border.primary}`,
  boxShadow: cssVar.card.shadow,
};

const variantStyles: Record<CardVariant, CSSProperties> = {
  default: {},
  interactive: {
    transition: `box-shadow var(--duration-normal) var(--ease-in-out)`,
    cursor: "pointer",
  },
  selected: {
    borderColor: cssVar.brand.primary,
    borderWidth: "2px",
    background: cssVar.brand.light,
  },
  disabled: {
    opacity: 0.6,
    pointerEvents: "none",
  },
};

export function Card({
  variant = "default",
  padding = "md",
  style,
  children,
  className,
  ...rest
}: CardProps) {
  const combinedStyle: CSSProperties = {
    ...baseStyle,
    ...paddingStyles[padding],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <div style={combinedStyle} className={className} {...rest}>
      {children}
    </div>
  );
}

// Card sub-components for structured layouts
export function CardHeader({
  children,
  style,
  className,
  transparent = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  transparent?: boolean;
}) {
  return (
    <div
      className={transparent ? cardPresets.headerTransparent : cardPresets.header}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  style,
  className,
  size = "md",
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? cardPresets.bodySm : size === "lg" ? cardPresets.bodyLg : cardPresets.body;
  
  return (
    <div className={sizeClass} style={style}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  style,
  className,
  transparent = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  transparent?: boolean;
}) {
  return (
    <div
      className={transparent ? cardPresets.footerTransparent : cardPresets.footer}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  style,
  as: Component = "h3",
}: {
  children: ReactNode;
  style?: CSSProperties;
  as?: "h1" | "h2" | "h3" | "h4" | "span";
}) {
  return (
    <Component className={cardPresets.title} style={style}>
      {children}
    </Component>
  );
}

export function CardSubtitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span className={cardPresets.subtitle} style={style}>
      {children}
    </span>
  );
}
