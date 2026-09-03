import type { CSSProperties, ElementType } from "react";
import type { SpacingStep } from "@tyandor/tokens";

/** A spacing-scale step, or `0` for no gap. */
export type Gap = SpacingStep | 0;

/**
 * Resolve a gap to a CSS value. Always `var(--ty-spacing-NN)` rather than
 * the underlying length, so an inline style set by a component is still
 * reading the token contract — the same rule that applies in a stylesheet.
 */
export const gapValue = (gap: Gap): string => (gap === 0 ? "0" : `var(--ty-spacing-${gap})`);

/**
 * Custom properties are not in React's CSSProperties, but they are valid in
 * a style object. This is the narrow escape hatch for the components that
 * pass their variable axis through one.
 */
export type StyleWithVars = CSSProperties & Record<`--${string}`, string | number>;

/** The tag a polymorphic component renders. */
export type As = ElementType;
