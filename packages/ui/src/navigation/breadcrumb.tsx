import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.ts";

export interface Crumb {
  readonly label: string;
  /** Omit on the final crumb — the current page is not a link to itself. */
  readonly href?: string;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  items: readonly Crumb[];
  /** Rendered between crumbs. Decorative and hidden from assistive tech. */
  separator?: ReactNode;
  /** Element each crumb link renders. Defaults to `a`; pass `linkAs={Link}` under Next. */
  linkAs?: ElementType;
}

/**
 * Trail of ancestor pages.
 *
 * The last item is rendered as text with aria-current="page" even when it
 * has an href: a link to the page you are already on is a dead end for
 * keyboard and screen-reader users, and the ordered list already carries
 * the hierarchy.
 */
export function Breadcrumb({
  items,
  separator = "/",
  linkAs: Link = "a",
  className,
  ...rest
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cx("ty-breadcrumb", className)} {...rest}>
      <ol className="ty-breadcrumb__list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="ty-breadcrumb__item">
              {isLast || !item.href ? (
                <span className="ty-breadcrumb__current" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="ty-breadcrumb__link ty-focus-ring ty-transition">
                  {item.label}
                </Link>
              )}
              {isLast ? null : (
                <span aria-hidden="true" className="ty-breadcrumb__separator">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
