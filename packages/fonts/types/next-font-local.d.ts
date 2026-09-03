/**
 * Ambient stub for `next/font/local`, used only to typecheck `src/next.ts`.
 *
 * Next is a *peer* of this package, not a dependency: pulling the framework
 * into a fonts repo to satisfy `tsc --noEmit` would be a hundred megabytes of
 * node_modules for one call signature. This file is deliberately excluded from
 * the published `files` list — shipping it would put a second
 * `declare module "next/font/local"` in front of consumers who have the real
 * types installed, and the two would collide.
 *
 * Kept to the subset of the API `src/next.ts` actually uses.
 */
declare module "next/font/local" {
  interface LocalFontSource {
    path: string;
    weight?: string;
    style?: string;
  }

  interface LocalFontOptions {
    src: string | LocalFontSource[];
    display?: "auto" | "block" | "swap" | "fallback" | "optional";
    variable?: string;
    fallback?: string[];
    preload?: boolean;
    adjustFontFallback?: false | "Arial" | "Times New Roman";
    declarations?: Array<{ prop: string; value: string }>;
  }

  interface NextFont {
    className: string;
    style: { fontFamily: string; fontWeight?: number; fontStyle?: string };
  }

  interface NextFontWithVariable extends NextFont {
    variable: string;
  }

  export default function localFont(options: LocalFontOptions): NextFontWithVariable;
}
