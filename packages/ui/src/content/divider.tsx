import type { HTMLAttributes } from "react";
import { cx } from "../internal/cx.ts";

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: "horizontal" | "vertical";
  /** Use border-strong rather than border-subtle. */
  strong?: boolean;
}

/**
 * A rule.
 *
 * Vertical dividers render as a `div` with role="separator": `hr` is
 * defined as a paragraph-level thematic break, and using one inside a flex
 * row of controls is a semantic claim the markup cannot honour.
 */
export function Divider({
  orientation = "horizontal",
  strong = false,
  className,
  ...rest
}: DividerProps) {
  const classes = cx("ty-divider", `ty-divider--${orientation}`, strong && "ty-divider--strong", className);

  if (orientation === "vertical") {
    return <div role="separator" aria-orientation="vertical" className={classes} {...rest} />;
  }
  return <hr className={classes} {...rest} />;
}
