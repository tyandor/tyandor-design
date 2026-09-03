import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  ReactNode,
} from "react";
import { cx } from "../internal/cx.ts";

interface PillCommon {
  /** Optional trailing count, e.g. a result tally on a category filter. */
  count?: number;
  children?: ReactNode;
  className?: string;
}

export interface PillLinkProps
  extends PillCommon,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> {
  href: string;
  /** Current page. Sets aria-current, which is what styles the active state. */
  active?: boolean;
  /** Element to render. Defaults to `a`; pass `as={Link}` under Next. */
  as?: ElementType;
}

export interface PillButtonProps
  extends PillCommon,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  href?: undefined;
  /** Toggled on. Sets aria-pressed, which is what styles the active state. */
  active?: boolean;
}

export type PillProps = PillLinkProps | PillButtonProps;

/**
 * Category pill — a filter chip.
 *
 * Renders an anchor when given `href` and a button otherwise, and the ARIA
 * follows: a link that navigates gets aria-current="page", a control that
 * toggles gets aria-pressed. Both drive the same visual state from the
 * stylesheet, so the appearance cannot drift from what is announced.
 */
export function Pill({ active = false, count, className, children, ...rest }: PillProps) {
  const classes = cx("ty-pill", "ty-focus-ring", "ty-transition", className);
  const body = (
    <>
      {children}
      {count === undefined ? null : <span className="ty-pill__count">{count}</span>}
    </>
  );

  if (typeof rest.href === "string") {
    const { href, as: Component = "a", ...anchorProps } = rest as PillLinkProps;
    return (
      <Component
        href={href}
        aria-current={active ? "page" : undefined}
        className={classes}
        {...anchorProps}
      >
        {body}
      </Component>
    );
  }

  const { href: _ignored, ...buttonProps } = rest as PillButtonProps;
  return (
    <button type="button" aria-pressed={active} className={classes} {...buttonProps}>
      {body}
    </button>
  );
}
