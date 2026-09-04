import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.ts";

export interface QuoteProps extends HTMLAttributes<HTMLElement> {
  /** Display-weight treatment that breaks the measure deliberately. */
  pull?: boolean;
  /** Rendered in a `footer` inside the blockquote, per the HTML spec's guidance. */
  attribution?: ReactNode;
  /** Source URL, surfaced as the blockquote's `cite` attribute. */
  cite?: string;
  children?: ReactNode;
}

export function Quote({ pull = false, attribution, cite, className, children, ...rest }: QuoteProps) {
  return (
    <blockquote
      cite={cite}
      className={cx("ty-quote", pull && "ty-quote--pull", className)}
      {...rest}
    >
      {children}
      {attribution ? (
        <footer className="ty-quote__attribution">{attribution}</footer>
      ) : null}
    </blockquote>
  );
}
