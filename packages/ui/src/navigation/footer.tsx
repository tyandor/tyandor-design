import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.ts";
import type { StyleWithVars } from "../internal/types.ts";

export interface FooterProps extends HTMLAttributes<HTMLElement> {
  /** Fine print below the divider — copyright, licence, build info. */
  baseline?: ReactNode;
  /** Max width of the footer's content, e.g. "72rem". Unset runs full-bleed. */
  maxWidth?: string;
  children?: ReactNode;
}

/** Site footer. Children are laid out as auto-fitting columns. */
export function Footer({ baseline, maxWidth, className, style, children, ...rest }: FooterProps) {
  return (
    <footer
      className={cx("ty-footer", className)}
      style={
        (maxWidth ? { "--ty-container-max": maxWidth, ...style } : style) as StyleWithVars
      }
      {...rest}
    >
      <div className="ty-footer__inner">
        <div className="ty-footer__columns">{children}</div>
        {baseline ? <div className="ty-footer__baseline">{baseline}</div> : null}
      </div>
    </footer>
  );
}

export interface FooterColumnProps extends HTMLAttributes<HTMLElement> {
  heading?: ReactNode;
  children?: ReactNode;
}

export function FooterColumn({ heading, className, children, ...rest }: FooterColumnProps) {
  return (
    <div className={cx("ty-footer__column", className)} {...rest}>
      {heading ? <h2 className="ty-footer__heading">{heading}</h2> : null}
      {children}
    </div>
  );
}
