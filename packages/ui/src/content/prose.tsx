import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.ts";

export interface ProseProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children?: ReactNode;
}

/**
 * Article body styles for content this package did not author — CMS HTML,
 * compiled Markdown, MDX output.
 *
 * Every rule inside is written with :where(), so it lands at zero
 * specificity: a consumer's own selectors win without !important, and a
 * component rendered inside prose keeps its own styling rather than being
 * restyled by its container.
 */
export function Prose({ as: Component = "div", className, children, ...rest }: ProseProps) {
  return (
    <Component className={cx("ty-prose", className)} {...rest}>
      {children}
    </Component>
  );
}
