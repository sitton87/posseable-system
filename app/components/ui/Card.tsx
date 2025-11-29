import type { CSSProperties, HTMLAttributes } from "react";
import { cardStyle as baseCardStyle } from "@/app/styles/components";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  style?: CSSProperties;
};

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <div style={{ ...baseCardStyle, ...style }} {...rest}>
      {children}
    </div>
  );
}
