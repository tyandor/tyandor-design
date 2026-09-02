/**
 * Carbon's spacing scale, adopted verbatim (PLAN.md 1b).
 *
 * Everything is a multiple of the 2px micro-unit and, from spacing-03 up,
 * of the 8px mini-unit that the 2x grid is built on. Adopted rather than
 * invented: this is the best-tested part of Carbon.
 */
export const spacing = {
  "01": "0.125rem", //   2px
  "02": "0.25rem",  //   4px
  "03": "0.5rem",   //   8px
  "04": "0.75rem",  //  12px
  "05": "1rem",     //  16px
  "06": "1.5rem",   //  24px
  "07": "2rem",     //  32px
  "08": "2.5rem",   //  40px
  "09": "3rem",     //  48px
  "10": "4rem",     //  64px
  "11": "5rem",     //  80px
  "12": "6rem",     //  96px
  "13": "10rem",    // 160px
} as const;

/** Carbon's control heights: sm / md / lg. Used by Button, Input, Select. */
export const sizes = {
  sm: "2rem",   // 32px
  md: "2.5rem", // 40px
  lg: "3rem",   // 48px
} as const;

export type SpacingStep = keyof typeof spacing;

/**
 * Canonical iteration order.
 *
 * NOT redundant with `Object.keys(spacing)`. ECMAScript emits integer-index-like
 * keys first in ascending numeric order, so "10".."13" (canonical integers) sort
 * ahead of "01".."09" (non-canonical, leading zero). Anything that serialises the
 * scale — tokens.css, tokens.json, and the downstream nvim/terminal generators
 * that consume it — must walk this array instead.
 */
export const spacingOrder = [
  "01", "02", "03", "04", "05", "06", "07",
  "08", "09", "10", "11", "12", "13",
] as const satisfies readonly SpacingStep[];
