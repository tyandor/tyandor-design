import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../internal/cx.ts";

export type TagVariant = "neutral" | "outline" | "error" | "warning" | "success" | "info";

export interface TagProps extends HTMLAttributes<HTMLElement> {
  variant?: TagVariant;
  /** Leading status dot in the variant's support colour. */
  dot?: boolean;
  children?: ReactNode;
}

/**
 * Small label — status, category, metadata.
 *
 * Support variants are tinted outlines rather than solid fills. A solid
 * support colour would need a matching on-colour text token for each of the
 * four roles in both themes; the outline keeps text on text-primary, which
 * the contrast gate already guarantees against every layer.
 */
export function Tag({ variant = "neutral", dot = false, className, children, ...rest }: TagProps) {
  return (
    <span
      className={cx("ty-tag", variant !== "neutral" && `ty-tag--${variant}`, className)}
      {...rest}
    >
      {dot ? <span className="ty-tag__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/** Alias. Badge and Tag are the same object; the two names are both in use. */
export const Badge = Tag;
