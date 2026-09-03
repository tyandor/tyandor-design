import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.ts";
import { gapValue, type Gap, type StyleWithVars } from "../internal/types.ts";

export interface StackProps extends HTMLAttributes<HTMLElement> {
  direction?: "vertical" | "horizontal";
  /** Spacing-scale step. Defaults to `05` (16px). */
  gap?: Gap;
  align?: "start" | "center" | "end" | "baseline" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  /** Horizontal stacks wrap by default so rows of tags reflow rather than overflow. */
  wrap?: boolean;
  as?: ElementType;
  children?: ReactNode;
}

/** One-dimensional layout on the spacing scale. */
export function Stack({
  direction = "vertical",
  gap = "05",
  align,
  justify,
  wrap,
  as: Component = "div",
  className,
  style,
  children,
  ...rest
}: StackProps) {
  const shouldWrap = wrap ?? direction === "horizontal";
  return (
    <Component
      className={cx(
        "ty-stack",
        `ty-stack--${direction}`,
        shouldWrap ? "ty-stack--wrap" : "ty-stack--nowrap",
        align && `ty-stack--align-${align}`,
        justify && `ty-stack--justify-${justify}`,
        className,
      )}
      style={{ "--ty-stack-gap": gapValue(gap), ...style } as StyleWithVars}
      {...rest}
    >
      {children}
    </Component>
  );
}

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** Fixed track count. Collapses to one column below the md breakpoint (672px). */
  columns?: number;
  /**
   * Auto-fit track sizing: as many columns as fit at this minimum width.
   * Takes precedence over `columns` — the two describe the same axis, and
   * an auto-fit grid needs no breakpoint because it has no fixed count.
   */
  minItemWidth?: string;
  /** Spacing-scale step. Defaults to `06` (24px). */
  gap?: Gap;
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Two-dimensional layout.
 *
 * Note this renders `.ty-grid-layout`, not `.ty-grid`: tokens.css already
 * owns `.ty-grid` for the canonical 16-column fluid 2x grid, which stays
 * available to consumers who never install this package.
 */
export function Grid({
  columns = 1,
  minItemWidth,
  gap = "06",
  as: Component = "div",
  className,
  style,
  children,
  ...rest
}: GridProps) {
  const auto = minItemWidth !== undefined;
  return (
    <Component
      className={cx("ty-grid-layout", auto && "ty-grid-layout--auto", className)}
      style={
        {
          "--ty-grid-layout-gap": gapValue(gap),
          ...(auto
            ? { "--ty-grid-layout-min": minItemWidth }
            : { "--ty-grid-layout-columns": columns }),
          ...style,
        } as StyleWithVars
      }
      {...rest}
    >
      {children}
    </Component>
  );
}
