/**
 * Role tokens: Carbon's taxonomy, Expanse's values.
 *
 * Token NAMES follow Carbon v11's role-based model. Token VALUES are drawn
 * exclusively from the primitives in `color.ts`. If a role needs a value the
 * palette does not contain, the palette changes upstream — we do not invent
 * hexes here.
 *
 * `kind` drives the contrast checker (scripts/check-contrast.ts):
 *   surface — can sit behind other things
 *   text    — must reach 4.5:1 on the surfaces it is used over (3:1 if large)
 *   nontext — borders, icons, focus rings: 3:1 (WCAG 1.4.11)
 *   scrim   — semi-transparent, excluded from static contrast maths
 */
import { accents as a, backgrounds as bg, foregrounds as fg, highlights as hl, onDark, onLight, type Dual } from "./color.ts";

export type RoleKind = "surface" | "text" | "nontext" | "scrim";

export interface Role {
  readonly value: Dual;
  readonly kind: RoleKind;
  readonly desc: string;
  /**
   * Surfaces this role is legitimately used over. Only meaningful for
   * `text` and `nontext` roles; the contrast checker walks exactly these.
   */
  readonly over?: readonly string[];
  /** Text roles intended for large text / headings only (>=24px or >=18.66px bold). */
  readonly largeOnly?: boolean;
}

/** Every surface a foreground role may legitimately land on. */
const LAYERS = ["background", "layer-01", "layer-02", "layer-hover", "field"] as const;

const dual = (p: Dual): Dual => ({ mcrn: p.mcrn, earth: p.earth });

/**
 * A primitive with one or both variants replaced by its UI-contrast variant.
 * Kept explicit at the role level rather than patched into the primitives, so
 * it stays visible exactly which roles deviate from upstream and which do not
 * (syntax highlighting and decorative use keep the original hexes).
 */
const tuned = (p: Dual, o: { mcrn?: string; earth?: string }): Dual => ({
  mcrn: o.mcrn ?? p.mcrn,
  earth: o.earth ?? p.earth,
});

const roleTable = {
  // ── Layering ────────────────────────────────────────────────────────
  "background":       { value: dual(bg.base),    kind: "surface", desc: "Page background, deepest layer" },
  "layer-01":         { value: dual(bg.surface), kind: "surface", desc: "Cards, editors, first layer above the page" },
  "layer-02":         { value: dual(bg.overlay), kind: "surface", desc: "Modals, menus, floating panels" },
  "layer-hover":      { value: dual(bg.raised),  kind: "surface", desc: "Hover state for any layer, active rows" },
  "field":            { value: dual(bg.surface), kind: "surface", desc: "Input, textarea, select background" },
  "field-hover":      { value: dual(bg.raised),  kind: "surface", desc: "Hovered input background" },

  // ── Borders ─────────────────────────────────────────────────────────
  "border-subtle":      { value: dual(a.void),  kind: "nontext", desc: "Dividers, card outlines", over: LAYERS },
  "border-strong":      { value: tuned(fg.muted, { mcrn: onDark.muted, earth: onLight.muted }), kind: "nontext", desc: "Input outlines, emphasized boundaries", over: LAYERS },
  "border-interactive": { value: tuned(a.amber, { earth: onLight.amber }), kind: "nontext", desc: "Selected/active control boundary", over: LAYERS },

  // ── Text ────────────────────────────────────────────────────────────
  "text-primary":     { value: dual(fg.text),   kind: "text", desc: "Body copy, primary readout", over: LAYERS },
  "text-secondary":   { value: tuned(fg.subtle, { earth: onLight.subtle }), kind: "text", desc: "Captions, metadata, helper text", over: LAYERS },
  // Subtle, not Muted: placeholders are real text and must clear 4.5:1. Muted
  // could not do it in EITHER theme, which is what the contrast gate caught.
  "text-placeholder": { value: tuned(fg.subtle, { earth: onLight.subtle }), kind: "text", desc: "Input placeholders", over: ["field", "field-hover"] },
  "text-emphasis":    { value: dual(fg.bright), kind: "text", desc: "Headings, emphasized content", over: LAYERS },
  "text-disabled":    { value: dual(fg.muted),  kind: "text", desc: "Disabled control labels (WCAG-exempt)", over: LAYERS },
  // Not in the PLAN table, but a filled Button needs it. Resolves to the page
  // background of its own theme: MCRN fills are light accents wanting dark text,
  // Earth fills are dark accents wanting light text. Base satisfies both.
  // Two tokens, because Earth's fills split in two directions: support-error /
  // -success / -info and gold are DARK on Earth and want a light label, while
  // amber and flare stay light and want a dark one. One token cannot serve both.
  "text-on-color":    { value: { mcrn: bg.base.mcrn, earth: bg.overlay.earth }, kind: "text", desc: "Label on a dark filled colour", over: ["interactive-hover", "support-error", "support-success", "support-info"] },
  "text-on-accent":   { value: { mcrn: bg.base.mcrn, earth: fg.bright.earth }, kind: "text", desc: "Label on a light filled colour (amber, flare)", over: ["interactive", "support-warning"] },

  // ── Icons ───────────────────────────────────────────────────────────
  "icon-primary":   { value: dual(fg.text),   kind: "nontext", desc: "Default icon fill", over: LAYERS },
  "icon-secondary": { value: tuned(fg.subtle, { earth: onLight.subtle }), kind: "nontext", desc: "Secondary/decorative icon fill", over: LAYERS },

  // ── Interactive ─────────────────────────────────────────────────────
  "interactive":       { value: tuned(a.amber, { earth: onLight.amber }), kind: "nontext", desc: "Primary action fill, cursor, accent chrome", over: LAYERS },
  "interactive-hover": { value: dual(a.gold),  kind: "nontext", desc: "Hovered/pressed primary action", over: LAYERS },
  "link":              { value: tuned(a.cyan, { earth: onLight.cyan }), kind: "text", desc: "Inline and navigation links", over: LAYERS },
  "link-hover":        { value: dual(a.ice),   kind: "text",    desc: "Hovered link", over: LAYERS },
  "focus":             { value: tuned(a.amber, { earth: onLight.amber }), kind: "nontext", desc: "Focus ring", over: LAYERS },
  "focus-inset":       { value: dual(bg.base), kind: "nontext", desc: "Inner ring drawn inside the focus ring", over: ["interactive"] },

  // ── Support / status ────────────────────────────────────────────────
  "support-error":   { value: dual(a.mars),  kind: "text", desc: "Errors, destructive actions", over: LAYERS },
  // largeOnly: Flare cannot reach 4.5:1 on light layers without turning brown.
  // Promise: warning colour carries status icons, badges and headings — never
  // small body copy. Use text-primary for the sentence, Flare for the marker.
  "support-warning": { value: tuned(a.flare, { earth: onLight.flare }), kind: "text", largeOnly: true, desc: "Warnings, degraded status (large text and icons only)", over: LAYERS },
  "support-success": { value: dual(a.green), kind: "text", desc: "Success, nominal status", over: LAYERS },
  "support-info":    { value: dual(a.ice),   kind: "text", desc: "Informational status", over: LAYERS },

  // ── Emphasis ────────────────────────────────────────────────────────
  "highlight":        { value: dual(hl.med),  kind: "surface", desc: "Selection background, visual mode" },
  "highlight-strong": { value: dual(hl.high), kind: "surface", desc: "Search matches, active indicators" },

  // ── Overlay scrim ───────────────────────────────────────────────────
  "overlay": {
    value: { mcrn: "rgba(5, 9, 16, 0.72)", earth: "rgba(42, 58, 74, 0.48)" },
    kind: "scrim",
    desc: "Modal/drawer scrim (Base and Text at alpha)",
  },
} as const satisfies Record<string, Role>;

export type RoleName = keyof typeof roleTable;

/**
 * `as const satisfies` gives us literal key inference, but it also narrows each
 * entry to its own literal shape — which drops the optional `largeOnly`/`over`
 * members from the inferred type. Re-exporting through an explicit
 * `Record<RoleName, Role>` view keeps the exact key union AND the full Role
 * surface for consumers.
 */
export const roles: Record<RoleName, Role> = roleTable;

/** Surfaces available as contrast backdrops, resolved per variant. */
export const surfaceRoles = (Object.keys(roleTable) as RoleName[]).filter((n) => roles[n].kind === "surface");
