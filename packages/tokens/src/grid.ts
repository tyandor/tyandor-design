/**
 * Breakpoints and 2x grid (PLAN.md 1b).
 *
 * Carbon's breakpoint set. We take the concept of the 16-column fluid grid
 * but not Carbon's grid CSS classes — Tailwind's container plus a `.ty-grid`
 * utility covers what a personal site actually renders.
 */
export const breakpoints = {
  sm: "20rem",   //  320px
  md: "42rem",   //  672px
  lg: "66rem",   // 1056px
  xlg: "82rem",  // 1312px
  max: "99rem",  // 1584px
} as const;

/** The 2x grid: 16 fluid columns, everything aligned to an 8px mini-unit. */
export const grid = {
  columns: 16,
  miniUnit: "0.5rem",
  gutter: "2rem", // 32px, Carbon's fluid gutter
  gutterCondensed: "0.0625rem",
  /** Comfortable measure for duospace prose (PLAN.md 1c). */
  measure: "65ch",
} as const;

export type Breakpoint = keyof typeof breakpoints;
