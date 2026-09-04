import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.ts";
import type { StyleWithVars } from "../internal/types.ts";

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Wordmark / logo. Rendered at the inline start. */
  brand?: ReactNode;
  /** Primary navigation. Wrapped in a `nav` landmark. */
  nav?: ReactNode;
  /** Trailing slot — theme toggle, search, account. */
  actions?: ReactNode;
  /** Translucent + blurred, where the browser supports backdrop-filter. */
  blur?: boolean;
  /** Max width of the bar's content, e.g. "72rem". Unset runs full-bleed. */
  maxWidth?: string;
  children?: ReactNode;
}

/**
 * Sticky site header.
 *
 * Three slots rather than free children, because the arrangement — brand at
 * the start, nav beside it, actions at the end — is the design decision.
 * Pass `children` instead to lay out the bar yourself.
 */
export function Header({
  brand,
  nav,
  actions,
  blur = false,
  maxWidth,
  className,
  style,
  children,
  ...rest
}: HeaderProps) {
  return (
    <header
      className={cx("ty-header", blur && "ty-header--blur", className)}
      style={
        (maxWidth ? { "--ty-container-max": maxWidth, ...style } : style) as StyleWithVars
      }
      {...rest}
    >
      {children ?? (
        <div className="ty-header__inner">
          <div className="ty-stack ty-stack--horizontal ty-stack--align-center ty-stack--nowrap">
            {brand}
            {nav ? <nav className="ty-header__nav">{nav}</nav> : null}
          </div>
          {actions ? (
            <div className="ty-stack ty-stack--horizontal ty-stack--align-center ty-stack--nowrap">
              {actions}
            </div>
          ) : null}
        </div>
      )}
    </header>
  );
}

export interface HeaderBrandProps extends HTMLAttributes<HTMLElement> {
  href?: string;
  /**
   * Element to render. Defaults to `a`; a Next app passes `as={Link}` to
   * keep client-side navigation. This is why the package does not import
   * next/link itself — doing so would make it unusable outside Next.
   */
  as?: ElementType;
  children?: ReactNode;
}

export function HeaderBrand({
  href = "/",
  as: Component = "a",
  className,
  children,
  ...rest
}: HeaderBrandProps) {
  return (
    <Component href={href} className={cx("ty-header__brand", "ty-focus-ring", className)} {...rest}>
      {children}
    </Component>
  );
}

export interface HeaderLinkProps extends HTMLAttributes<HTMLElement> {
  href: string;
  /** Marks the current page. Sets aria-current, which is also what styles it. */
  active?: boolean;
  /** Element to render. Defaults to `a`; pass `as={Link}` under Next. */
  as?: ElementType;
  children?: ReactNode;
}

export function HeaderLink({
  href,
  active = false,
  as: Component = "a",
  className,
  children,
  ...rest
}: HeaderLinkProps) {
  return (
    <Component
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx("ty-header__link", "ty-focus-ring", "ty-transition", className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
