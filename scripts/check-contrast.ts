/**
 * Contrast gate (PLAN.md 1e).
 *
 * Walks every text/nontext role against every surface it declares in its
 * `over` list, in both themes, and asserts WCAG AA. Pairs are derived from
 * token metadata rather than hand-listed, so a new token is checked the
 * moment it exists — a hand-maintained pair list rots on the first commit
 * that adds a role.
 *
 * Exit 1 on any unexempted failure.
 */
import { roles, type RoleName } from "../packages/tokens/src/themes.ts";
import { contrastRatio, round2, WCAG } from "../packages/tokens/src/contrast.ts";
import type { Variant } from "../packages/tokens/src/color.ts";
import { EXEMPTIONS, isExempt } from "./contrast-policy.ts";

const VARIANTS: Variant[] = ["mcrn", "earth"];
const ROLE_NAMES = Object.keys(roles) as RoleName[];

export interface Pair {
  variant: Variant;
  fg: RoleName;
  bg: RoleName;
  ratio: number;
  required: number;
  kind: "text" | "nontext";
  passes: boolean;
}

function enumeratePairs(): Pair[] {
  const out: Pair[] = [];
  for (const variant of VARIANTS) {
    for (const fgName of ROLE_NAMES) {
      const fg = roles[fgName];
      if (fg.kind !== "text" && fg.kind !== "nontext") continue;
      for (const target of fg.over ?? []) {
        const bgName = target as RoleName;
        const bg = roles[bgName];
        if (!bg) throw new Error(`${fgName}.over references unknown role "${target}"`);
        const fgValue = fg.value[variant];
        const bgValue = bg.value[variant];
        const required =
          fg.kind === "nontext"
            ? WCAG.AA_NON_TEXT
            : fg.largeOnly
              ? WCAG.AA_LARGE_TEXT
              : WCAG.AA_TEXT;
        const ratio = round2(contrastRatio(fgValue, bgValue));
        out.push({ variant, fg: fgName, bg: bgName, ratio, required, kind: fg.kind, passes: ratio >= required });
      }
    }
  }
  return out;
}

const pairs = enumeratePairs();
const failures = pairs.filter((p) => !p.passes);
const unexempt = failures.filter((p) => !isExempt(p));
const exemptedFailures = failures.filter((p) => isExempt(p));

const bar = "─".repeat(72);
console.log(`\n  Expanse contrast audit — WCAG 2.1 AA`);
console.log(`  ${pairs.length} pairings across 2 themes\n${bar}`);

for (const variant of VARIANTS) {
  const vp = pairs.filter((p) => p.variant === variant);
  const bad = vp.filter((p) => !p.passes);
  const label = variant === "mcrn" ? "MCRN  (dark)" : "EARTH (light)";
  console.log(`  ${label}   ${vp.length - bad.length}/${vp.length} pass`);
}
console.log(bar);

if (failures.length) {
  console.log(`\n  Below threshold:\n`);
  const rows = failures
    .slice()
    .sort((a, b) => a.ratio - b.ratio)
    .map((p) => {
      const flag = isExempt(p) ? "exempt" : "FAIL";
      return `  ${flag.padEnd(7)} ${p.variant.padEnd(6)} ${p.fg.padEnd(20)} on ${p.bg.padEnd(14)} ${String(p.ratio).padStart(5)} : 1  (needs ${p.required})`;
    });
  console.log(rows.join("\n"));
}

console.log(`\n${bar}`);
console.log(`  exempted: ${exemptedFailures.length}   failing: ${unexempt.length}   (${EXEMPTIONS.length} exemption rules)\n`);

if (unexempt.length > 0) {
  console.error(`  Contrast gate FAILED — ${unexempt.length} unexempted pairing(s) below AA.\n`);
  process.exit(1);
}
console.log(`  Contrast gate passed.\n`);
