/**
 * Type-scale gate.
 *
 * Fails when an app hard-codes a font size instead of reaching for a scale
 * token — `text-[11px]` in JSX, or a literal `font-size` in app CSS.
 *
 * This exists because of a real regression, not a hypothetical one: the docs
 * app accumulated 49 arbitrary sizes, 32 of them at one size, because the
 * type scale was never wired into Tailwind 4's @theme and `text-[11px]` was
 * the only way to size text. The scale now reaches apps through ui.css's
 * .ty-type-* / .ty-label classes; this asserts nobody quietly reopens the
 * shortcut. See packages/tokens/src/type.ts for why label-01 exists.
 *
 * Part of `bun run ci` — unlike check-palette-drift, it needs nothing but
 * this repo.
 */
import { typeScale, type TypeToken } from "../packages/tokens/src/type.ts";

const ROOT_PX = 16;

/** Scale sizes in px, for "did you mean" reporting. */
const inPx = Object.entries(typeScale).map(([token, style]) => {
  const raw = style.size;
  const n = parseFloat(raw);
  return { token: token as TypeToken, px: raw.endsWith("rem") ? n * ROOT_PX : n };
});

function nearest(px: number): { token: TypeToken; px: number } {
  return inPx.reduce((best, c) => (Math.abs(c.px - px) < Math.abs(best.px - px) ? c : best));
}

/** `text-[13px]` / `text-[0.8125rem]` — Tailwind's arbitrary font-size escape. */
const ARBITRARY_UTILITY = /text-\[(\d+(?:\.\d+)?)(px|rem)\]/g;
/** A literal `font-size:` in app CSS. `var(--ty-*)` is the sanctioned form. */
const LITERAL_CSS = /font-size:\s*(?!var\()([^;}]+)/g;

interface Problem {
  file: string;
  line: number;
  found: string;
  hint: string;
}

const problems: Problem[] = [];

async function scan(glob: string, pattern: RegExp, toPx: (m: RegExpExecArray) => number | null) {
  for await (const rel of new Bun.Glob(glob).scan(".")) {
    const text = await Bun.file(rel).text();
    text.split("\n").forEach((line, i) => {
      for (const m of line.matchAll(pattern)) {
        const px = toPx(m as RegExpExecArray);
        const hint =
          px === null
            ? "use a --ty-*-size custom property"
            : (() => {
                const n = nearest(px);
                const exact = Math.abs(n.px - px) < 0.01;
                return `${exact ? "is exactly" : "nearest is"} ${n.token} (${n.px}px) — use .ty-type-${n.token}`;
              })();
        problems.push({ file: rel, line: i + 1, found: m[0].trim(), hint });
      }
    });
  }
}

await scan("apps/**/*.tsx", ARBITRARY_UTILITY, (m) =>
  m[2] === "rem" ? parseFloat(m[1]!) * ROOT_PX : parseFloat(m[1]!),
);
await scan("apps/**/*.css", LITERAL_CSS, (m) => {
  const v = m[1]!.trim();
  const n = parseFloat(v);
  if (Number.isNaN(n)) return null;
  return v.endsWith("rem") ? n * ROOT_PX : v.endsWith("px") ? n : null;
});

console.log(`\n  Type scale — ${inPx.length} tokens, ${inPx[0]!.token} (${inPx[0]!.px}px) is the floor\n`);

if (problems.length) {
  for (const p of problems) {
    console.error(`  HARD-CODED  ${p.file}:${p.line}  ${p.found}`);
    console.error(`              ${p.hint}`);
  }
  console.error(`\n  ${problems.length} hard-coded size(s). Reach for the scale, or add a token.\n`);
  process.exit(1);
}
console.log(`  No hard-coded font sizes in apps/.\n`);
