/**
 * `next/font/local` bindings — the path PLAN.md designates for tyandor-web.
 *
 * Why this lives *inside* the package rather than exporting a config object:
 * `next/font/local` resolves every `src.path` relative to the file that calls
 * it, and its loader reads the call at build time from the AST. A config
 * handed to a consumer's own `localFont()` would resolve against their file
 * and break. So the call happens here, next to the woff2 files it names.
 *
 * Two consequences, both deliberate:
 *
 *   1. Every option below is an inline literal. Next requires font-loader
 *      arguments to be statically analysable, so nothing here may be spread
 *      or imported — not even the fallback stack that `index.ts` exports.
 *      `test/fonts.test.ts` asserts these literals still match the manifest.
 *   2. Consumers must transpile this package:
 *      `next.config.js` -> `transpilePackages: ["@tyandor/fonts"]`.
 *
 * The `variable` names are the token contract's own. Putting `duo.variable` on
 * <html> rewrites `--ty-font-body` to Next's hashed family, so every component
 * reading `var(--ty-font-body)` follows without knowing Next exists.
 */
import localFont from "next/font/local";

/**
 * Body, headings, UI. Uses the `all` cut (latin + latin-ext in one file):
 * next/font emits its own @font-face rules and has no way to express
 * unicode-range, so handing it the split files would leave the second rule
 * masking the first for every glyph.
 */
export const duo = localFont({
  src: [
    { path: "../dist/files/ia-writer-duo.woff2", weight: "400 700", style: "normal" },
    { path: "../dist/files/ia-writer-duo-italic.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
  variable: "--ty-font-body",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  // Next can only size-adjust against Arial or Times, both proportional. Duo
  // is duospace, so the "corrected" fallback would reflow harder than the
  // monospace stack above. Better an honest fallback than a mis-scaled one.
  adjustFontFallback: false,
});

/**
 * Code and terminal-style readouts. Not preloaded: most pages render no code,
 * and a preload hint the page never redeems costs the same bytes as one it does.
 */
export const mono = localFont({
  src: [
    { path: "../dist/files/ia-writer-mono.woff2", weight: "400 700", style: "normal" },
    { path: "../dist/files/ia-writer-mono-italic.woff2", weight: "400 700", style: "italic" },
  ],
  display: "swap",
  variable: "--ty-font-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  adjustFontFallback: false,
  preload: false,
});

/** Both variable classes, ready for `<html className={fontVariables}>`. */
export const fontVariables = `${duo.variable} ${mono.variable}`;
