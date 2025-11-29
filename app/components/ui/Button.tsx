import { buttonVariants } from "@/app/styles/components";
import type { ButtonHTMLAttributes, CSSProperties } from "react";

type ButtonVariant = keyof typeof buttonVariants;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  style?: CSSProperties;
};

export function Button({
  variant = "primary",
  style,
  children,
  ...rest
}: ButtonProps) {
  const baseStyle = buttonVariants[variant] ?? buttonVariants.primary;

  return (
    <button style={{ ...baseStyle, ...style }} {...rest}>
      {children}
    </button>
  );
}
