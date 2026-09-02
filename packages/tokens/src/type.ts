/**
 * Typography (PLAN.md 1c).
 *
 * Carbon's role-based type tokens, trimmed to what a personal site renders,
 * and audited against iA Writer Duo rather than IBM Plex Sans. Duo is a
 * duospace face: it runs measurably wider than a proportional sans at the
 * same nominal size, so Carbon's productive sizes have been nudged up one
 * step at body level (14px -> 15/16px) and the line-heights opened toward
 * 1.6. Large sizes get negative tracking, which duospace needs more than
 * proportional type does.
 *
 * The lineage: iA Writer's faces are modifications of IBM Plex — Carbon's
 * own family — so this is a fork back toward the source, not a graft.
 */

export const fontFamily = {
  /** Headings, body, UI. */
  body: '"iA Writer Duo", "iA Writer Duospace", ui-monospace, SFMono-Regular, Menlo, monospace',
  /** Code, terminal-style readouts. */
  mono: '"iA Writer Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
  /**
   * Escape hatch reserved for long-form prose. Aliased to `body` today; if the
   * duospace-fatigue risk in PLAN.md proves real, point this at iA Writer
   * Quattro without touching the token contract.
   */
  prose: '"iA Writer Duo", "iA Writer Duospace", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

/** Duo variable spans 400-700. */
export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export interface TypeStyle {
  readonly size: string;
  readonly lineHeight: string;
  readonly weight: string;
  readonly letterSpacing: string;
}

const style = (size: string, lineHeight: string, weight: string, letterSpacing = "0"): TypeStyle =>
  ({ size, lineHeight, weight, letterSpacing });

export const typeScale = {
  // Code — iA Writer Mono, set one notch below body so it does not shout
  // inside a paragraph.
  "code-01": style("0.8125rem", "1.5", fontWeight.regular),  // 13px
  "code-02": style("0.875rem", "1.55", fontWeight.regular),  // 14px

  // Body — bumped from Carbon's 14/16 to 15/16 for Duo's wider set width.
  "body-01": style("0.9375rem", "1.6", fontWeight.regular),  // 15px, compact/UI prose
  "body-02": style("1rem", "1.65", fontWeight.regular),      // 16px, article body

  // Headings
  "heading-01": style("0.9375rem", "1.5", fontWeight.semibold),            // 15px
  "heading-02": style("1rem", "1.5", fontWeight.semibold),                 // 16px
  "heading-03": style("1.25rem", "1.45", fontWeight.semibold, "-0.01em"),  // 20px
  "heading-04": style("1.75rem", "1.35", fontWeight.semibold, "-0.015em"), // 28px
  "heading-05": style("2rem", "1.3", fontWeight.semibold, "-0.02em"),      // 32px
  "heading-06": style("2.625rem", "1.2", fontWeight.semibold, "-0.02em"),  // 42px

  // Display
  "display-01": style("2.625rem", "1.15", fontWeight.bold, "-0.025em"), // 42px
  "display-02": style("3.375rem", "1.1", fontWeight.bold, "-0.03em"),   // 54px
} as const;

export type TypeToken = keyof typeof typeScale;
