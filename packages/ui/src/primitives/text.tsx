import type { ElementType, HTMLAttributes, ReactNode } from "react";
import type { TypeToken } from "@tyandor/tokens";
import { cx } from "../internal/cx.ts";

/** Colour roles a text run can take. Maps 1:1 onto .ty-tone-* in ui.css. */
export type Tone =
  | "primary"
  | "secondary"
  | "emphasis"
  | "placeholder"
  | "disabled"
  | "on-color"
  | "link"
  | "error"
  | "warning"
  | "success"
  | "info"
  | "inherit";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Type-scale role. Defaults to `body-01` — compact UI prose. */
  size?: TypeToken;
  tone?: Tone;
  /** Constrain to the 65ch measure. Long-form text should almost always set this. */
  measure?: boolean;
  /** Uppercase, tracked-out Mono. The terminal-readout flourish. */
  readout?: boolean;
  /** Element to render. Defaults to `p`. */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * A run of text at a type-scale role.
 *
 * `size` names a role, not a pixel value — the scale is free to move under
 * it. Roles that render in Mono (code-01/02) pick up the mono stack from
 * their generated class, so callers never choose a family for a role.
 */
export function Text({
  size = "body-01",
  tone = "primary",
  measure = false,
  readout = false,
  as: Component = "p",
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Component
      className={cx(
        readout ? "ty-readout" : `ty-type-${size}`,
        `ty-tone-${tone}`,
        measure && "ty-measure",
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

/** h1–h6. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends Omit<TextProps, "as"> {
  /** Document outline position. Drives the tag; does not drive the size. */
  level?: HeadingLevel;
}

/**
 * Default visual weight per outline level. Overridable via `size`, which is
 * the point of keeping the two axes separate: a section that is
 * structurally an h2 can still be set at heading-02 when it sits inside a
 * card, without lying to a screen reader about the outline.
 */
const sizeForLevel: Record<HeadingLevel, TypeToken> = {
  1: "heading-06",
  2: "heading-05",
  3: "heading-04",
  4: "heading-03",
  5: "heading-02",
  6: "heading-01",
};

export function Heading({ level = 2, size, tone = "emphasis", ...rest }: HeadingProps) {
  return (
    <Text
      as={(`h${level}` as ElementType)}
      size={size ?? sizeForLevel[level]}
      tone={tone}
      {...rest}
    />
  );
}
