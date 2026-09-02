/**
 * WCAG 2.1 contrast maths.
 *
 * Exported from the package (not hidden in a script) because the docs-site
 * token browser needs exactly these numbers, and two implementations of the
 * same formula is one implementation too many.
 */

export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** Parses `#rgb` and `#rrggbb`. Throws on anything else — silence here would hide token typos. */
export function hexToRgb(hex: string): Rgb {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`Not a hex colour: ${hex}`);
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** Space-separated channels for `rgb(var(--x) / <alpha-value>)` in the Tailwind preset. */
export function rgbChannels(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

/** WCAG relative luminance (sRGB). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio, 1..21. Order-independent. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG 2.1 thresholds. */
export const WCAG = {
  /** 1.4.3 — body text at AA. */
  AA_TEXT: 4.5,
  /** 1.4.3 — text >=24px, or >=18.66px bold. */
  AA_LARGE_TEXT: 3,
  /** 1.4.11 — borders, icons, focus rings, UI boundaries. */
  AA_NON_TEXT: 3,
  /** 1.4.6 — enhanced. */
  AAA_TEXT: 7,
} as const;

export const round2 = (n: number): number => Math.round(n * 100) / 100;
