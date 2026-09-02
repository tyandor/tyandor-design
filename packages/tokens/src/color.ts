/**
 * Expanse palette primitives.
 *
 * Synced from `expanse/palette-site/palette.js`, which remains the upstream
 * source of truth for these hex values. Any change to a colour belongs there
 * first; this file mirrors it. The generated `tokens.json` is the machine
 * readable bridge back the other way (terminal + nvim theme generators).
 *
 * Nothing here is a *role*. Roles live in `themes.ts`. Components must never
 * reference a primitive directly — see PLAN.md, principle 1.
 */

/** The two palette variants: MCRN (dark, Martian naval), Earth (light, UN institutional). */
export type Variant = "mcrn" | "earth";

/** A value that resolves in both themes. Every token in the system is dual. */
export interface Dual {
  readonly mcrn: string;
  readonly earth: string;
}

interface Primitive extends Dual {
  readonly name: string;
  /** Upstream usage note, carried through for the docs site token browser. */
  readonly role: string;
  readonly tagline?: string;
}

/** Ordinal background ramp. Carbon's layering model maps onto this directly. */
export const backgrounds = {
  base: { name: "Base", mcrn: "#050910", earth: "#eef2f5", role: "Page background, deepest layer" },
  surface: { name: "Surface", mcrn: "#080c12", earth: "#f5f7f9", role: "Editor, card backgrounds" },
  overlay: { name: "Overlay", mcrn: "#0c1820", earth: "#ffffff", role: "Floating panels, modals, menus" },
  raised: { name: "Raised", mcrn: "#0d1a22", earth: "#e8edf2", role: "Hover states, active rows" },
} as const satisfies Record<string, Primitive>;

/** Ordinal foreground ramp, quietest to loudest. */
export const foregrounds = {
  muted: { name: "Muted", mcrn: "#2a6a7a", earth: "#8a9aaa", role: "Line numbers, disabled text, indent guides" },
  subtle: { name: "Subtle", mcrn: "#4a8a9a", earth: "#6a7a8a", role: "Comments, placeholders, secondary info" },
  text: { name: "Text", mcrn: "#7ecfcf", earth: "#2a3a4a", role: "Body text, primary readout" },
  bright: { name: "Bright", mcrn: "#e8f0f0", earth: "#0f1a2a", role: "Headings, emphasized content" },
} as const satisfies Record<string, Primitive>;

/** The ten named accents. Exported as `--ty-accent-*` for expressive use only. */
export const accents = {
  amber: { name: "Amber", mcrn: "#e8c97a", earth: "#b8860b", role: "Cursor, command input, function definitions", tagline: "Human warmth in cold vacuum" },
  cyan: { name: "Cyan", mcrn: "#7ecfcf", earth: "#0a7a8a", role: "Primary readout, links, variables", tagline: "Ship systems nominal" },
  ice: { name: "Ice", mcrn: "#8ab8d0", earth: "#1a5276", role: "Keywords, control flow, structural syntax", tagline: "Martian authority" },
  teal: { name: "Teal", mcrn: "#5ab0a0", earth: "#1a7a6a", role: "Types, structures, namespaces", tagline: "Engineering backbone" },
  green: { name: "Green", mcrn: "#5ec98e", earth: "#2a7a3a", role: "Strings, success, nominal status, git add", tagline: "All systems go" },
  gold: { name: "Gold", mcrn: "#c8a96e", earth: "#8a6a2a", role: "Constants, literals, faction labels", tagline: "Belter salvage markings" },
  mars: { name: "Mars", mcrn: "#ff6b47", earth: "#c0392b", role: "Errors, deletions, critical alerts", tagline: "Red planet, red alert" },
  flare: { name: "Flare", mcrn: "#ff9a3c", earth: "#d4740a", role: "Warnings, transponder signals, git change", tagline: "Proximity klaxon" },
  steel: { name: "Steel", mcrn: "#a0b8b8", earth: "#5a6a7a", role: "Builtins, brackets, neutral chrome", tagline: "Bulkhead gray" },
  void: { name: "Void", mcrn: "#1a3a4a", earth: "#c0ccd6", role: "Borders, separators, inactive panels", tagline: "Between the stars" },
} as const satisfies Record<string, Primitive>;

/** Selection / search emphasis ramp. */
export const highlights = {
  low: { name: "Highlight Low", mcrn: "#0d1a22", earth: "#e0e8ef", role: "Cursorline, subtle emphasis" },
  med: { name: "Highlight Med", mcrn: "#1a3a4a", earth: "#c0ccd6", role: "Selection background, visual mode" },
  high: { name: "Highlight High", mcrn: "#2a6a7a", earth: "#8ab0c8", role: "Search matches, active indicators" },
} as const satisfies Record<string, Primitive>;

export type AccentName = keyof typeof accents;

/**
 * Chart series order (PLAN.md 1a). Ordered for hue separation rather than
 * palette order, so adjacent series stay distinguishable.
 */
export const chartSeries = ["cyan", "amber", "teal", "flare", "ice", "green"] as const satisfies readonly AccentName[];

export const palette = { backgrounds, foregrounds, accents, highlights } as const;
