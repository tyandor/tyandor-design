/**
 * @tyandor/fonts — iA Writer Duo and Mono, subsetted for the web (PLAN.md phase 2).
 *
 * The binaries and `manifest.json` are produced by `scripts/subset-fonts.py`
 * and committed; everything here is a typed read of that manifest. Nothing in
 * this module touches the filesystem, so it is safe to import from anywhere.
 *
 * The seam with @tyandor/tokens is the family *name*, not an import: the token
 * `--ty-font-body` already resolves to `"iA Writer Duo", ...`, and the
 * `@font-face` rules in `fonts.css` declare exactly that family. Load the two
 * stylesheets in either order and they meet in the middle.
 */
import raw from "./manifest.json" with { type: "json" };

export type FontStyle = "normal" | "italic";

/**
 * `latin` and `latin-ext` are disjoint cuts driven by `unicode-range`; `all`
 * is their union in one file, for loaders that cannot express unicode-range
 * (notably `next/font/local`).
 */
export type SubsetName = "latin" | "latin-ext" | "all";

export interface FontAxis {
  /** OpenType axis tag: `wght`, or iA's letter-spacing axis `SPCG`. */
  readonly tag: string;
  readonly min: number;
  readonly default: number;
  readonly max: number;
}

export interface Face {
  /** CSS family name, e.g. `iA Writer Duo`. */
  readonly family: string;
  /** Kebab-case stem used for file names and export keys. */
  readonly slug: string;
  readonly style: FontStyle;
  readonly subset: SubsetName;
  /** File name inside `dist/files/`. */
  readonly file: string;
  readonly bytes: number;
  /** A variable-weight range, e.g. `"400 700"`. */
  readonly weight: string;
  /** Derived from the built file's own cmap — never a promise the binary can't keep. */
  readonly unicodeRange: readonly string[];
  readonly codepoints: number;
  readonly axes: readonly FontAxis[];
  /** Path inside the upstream repo this face was cut from. */
  readonly source: string;
}

export interface Upstream {
  readonly repo: string;
  readonly commit: string;
  readonly license: string;
}

export const upstream: Upstream = raw.upstream;

export const faces: readonly Face[] = raw.faces as readonly Face[];

/** The two families this package ships, in token order (body, then mono). */
export const families = ["iA Writer Duo", "iA Writer Mono"] as const;
export type FamilyName = (typeof families)[number];

/**
 * Fallback stack shared with `--ty-font-body` / `--ty-font-mono`.
 *
 * Deliberately monospace: Duo is a duospace face, so a proportional fallback
 * reflows the whole page when the real font swaps in. `ui-monospace` resolves
 * to SF Mono / Cascadia / the platform's own, all of which are metrically far
 * closer to Duo than any proportional default.
 */
export const fallback = [
  "ui-monospace",
  "SFMono-Regular",
  "Menlo",
  "monospace",
] as const;

/** Every face of one family, optionally narrowed to a single subset. */
export function facesOf(family: FamilyName, subset?: SubsetName): readonly Face[] {
  return faces.filter((f) => f.family === family && (subset === undefined || f.subset === subset));
}

/** Total transfer size for a subset, in bytes — what a reader actually pays. */
export function weightOf(subset: SubsetName): number {
  return faces.filter((f) => f.subset === subset).reduce((n, f) => n + f.bytes, 0);
}
