import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.ts";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Step up to layer-02 for a card nested on an already-layered surface. */
  raised?: boolean;
  /** Drop the padding — for cards whose content manages its own insets. */
  flush?: boolean;
  /** Whole-card link. Sets the hover treatment and renders an `a`. */
  href?: string;
  as?: ElementType;
  children?: ReactNode;
}

/**
 * A layered surface.
 *
 * Depth is layer colour plus border, not shadow: on MCRN's near-black
 * background a drop shadow renders as nothing at all, so elevation is
 * expressed the way the palette can actually show it. `raised` steps the
 * layer token up, which is Carbon's layering model — and picks up a real
 * shadow only on Earth, where --ty-shadow-01 is non-none.
 */
export function Card({
  raised = false,
  flush = false,
  href,
  as,
  className,
  children,
  ...rest
}: CardProps) {
  const Component: ElementType = as ?? (href ? "a" : "div");
  const isLink = href !== undefined;
  return (
    <Component
      {...(isLink ? { href } : {})}
      className={cx(
        "ty-card",
        raised && "ty-card--raised",
        flush && "ty-card--flush",
        isLink && "ty-card--link ty-focus-ring ty-transition",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export interface CardSlotProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children?: ReactNode;
}

export function CardTitle({ as: Component = "h3", className, children, ...rest }: CardSlotProps) {
  return (
    <Component className={cx("ty-card__title", className)} {...rest}>
      {children}
    </Component>
  );
}

export function CardBody({ as: Component = "p", className, children, ...rest }: CardSlotProps) {
  return (
    <Component className={cx("ty-card__body", className)} {...rest}>
      {children}
    </Component>
  );
}

export function CardFooter({ as: Component = "div", className, children, ...rest }: CardSlotProps) {
  return (
    <Component className={cx("ty-card__footer", className)} {...rest}>
      {children}
    </Component>
  );
}
