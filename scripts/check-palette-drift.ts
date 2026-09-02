/**
 * Palette drift check.
 *
 * `expanse/palette-site/palette.js` is the upstream source of truth for every
 * hex in this system, including the `ui` variants that role tokens consume as
 * onLight/onDark. This script asserts the two agree.
 *
 * Deliberately NOT part of `bun run ci`: it needs a sibling checkout that a
 * GitHub runner will not have. Run it locally after touching either side.
 * Skips cleanly (exit 0) when the expanse repo is not present.
 */
import { accents, backgrounds, foregrounds, onDark, onLight } from "../packages/tokens/src/color.ts";

const PALETTE_JS =
  process.env["EXPANSE_PALETTE"] ??
  `${process.env["HOME"]}/Projects/tyandor/expanse/palette-site/palette.js`;

const file = Bun.file(PALETTE_JS);
if (!(await file.exists())) {
  console.log(`  expanse palette not found at ${PALETTE_JS} — skipping drift check.`);
  process.exit(0);
}

interface Entry { name: string; mcrn: string; earth: string; ui?: { mcrn?: string; earth?: string } }

const src = await file.text();
const start = src.indexOf("const palette = {");
const end = src.indexOf("\n};", start) + 2;
if (start < 0 || end < 2) throw new Error("could not locate the palette literal in palette.js");
const upstream = (0, eval)(`(${src.slice(start + "const palette = ".length, end)})`) as Record<string, Entry[]>;

const byName = (group: string) =>
  Object.fromEntries((upstream[group] ?? []).map((e) => [e.name.toLowerCase(), e]));

const groups = {
  backgrounds: [backgrounds, byName("backgrounds")],
  foregrounds: [foregrounds, byName("foregrounds")],
  accents: [accents, byName("accents")],
} as const;

const problems: string[] = [];

for (const [group, [local, remote]] of Object.entries(groups)) {
  for (const [key, prim] of Object.entries(local as Record<string, { name: string; mcrn: string; earth: string }>)) {
    const up = (remote as Record<string, Entry>)[key];
    if (!up) { problems.push(`${group}.${key}: missing upstream`); continue; }
    if (up.mcrn !== prim.mcrn) problems.push(`${group}.${key}.mcrn: local ${prim.mcrn} vs upstream ${up.mcrn}`);
    if (up.earth !== prim.earth) problems.push(`${group}.${key}.earth: local ${prim.earth} vs upstream ${up.earth}`);
  }
}

// The UI variants must round-trip: every onLight/onDark value present upstream,
// and every upstream `ui` value claimed here. Drift in either direction is a bug.
const fgUp = byName("foregrounds");
const acUp = byName("accents");
const expected: Array<[string, string | undefined, string]> = [
  ["onLight.subtle", fgUp["subtle"]?.ui?.earth, onLight.subtle],
  ["onLight.muted", fgUp["muted"]?.ui?.earth, onLight.muted],
  ["onDark.muted", fgUp["muted"]?.ui?.mcrn, onDark.muted],
  ["onLight.amber", acUp["amber"]?.ui?.earth, onLight.amber],
  ["onLight.cyan", acUp["cyan"]?.ui?.earth, onLight.cyan],
  ["onLight.flare", acUp["flare"]?.ui?.earth, onLight.flare],
];
for (const [label, up, local] of expected) {
  if (up === undefined) problems.push(`${label}: no matching \`ui\` entry upstream`);
  else if (up !== local) problems.push(`${label}: local ${local} vs upstream ${up}`);
}

const upstreamUiCount = [...Object.values(fgUp), ...Object.values(acUp)]
  .filter((e) => e.ui && (e.ui.mcrn || e.ui.earth)).length;

console.log(`\n  Palette drift — ${PALETTE_JS.replace(process.env["HOME"] ?? "", "~")}\n`);
if (problems.length) {
  console.error(problems.map((p) => `  MISMATCH  ${p}`).join("\n"));
  console.error(`\n  ${problems.length} difference(s). palette.js is upstream — reconcile there first.\n`);
  process.exit(1);
}
console.log(`  In sync: primitives match, ${expected.length} ui variants across ${upstreamUiCount} upstream entries.\n`);
