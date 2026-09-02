/**
 * Contrast policy — which sub-AA pairings the system knowingly accepts.
 *
 * The audit in check-contrast.ts computes the numbers; this file decides what
 * to DO about them. Keeping the two apart matters: the maths is objective and
 * should never be edited, while the policy is a design judgment that wants a
 * documented reason attached to every entry.
 *
 * An exemption is a promise about usage, not a shrug. "Amber is large-text
 * only on Earth" is only true if nothing ships 15px amber body copy.
 */
import type { Pair } from "./check-contrast.ts";

export interface Exemption {
  /** Omit a field to match any value for it. */
  variant?: Pair["variant"];
  fg?: string;
  bg?: string;
  /** Required. Why this is acceptable, and what constrains its usage. */
  reason: string;
}

/**
 * Exemptions are promises about usage, not shrugs.
 *
 * Only WCAG-backed carve-outs live here. A pairing that is merely inconvenient
 * belongs in the palette, not in this list — see the audit notes in the Phase 1
 * commit for the clusters deliberately left failing.
 */
export const EXEMPTIONS: Exemption[] = [
  {
    fg: "text-disabled",
    reason:
      "WCAG 2.1 SC 1.4.3 exempts text in an inactive user-interface component " +
      "by name. Promise: this role is used ONLY on genuinely disabled controls " +
      "— never to grey down text that a user is still expected to read.",
  },
  {
    fg: "border-subtle",
    reason:
      "WCAG 2.1 SC 1.4.11 covers boundaries required to identify a component or " +
      "its state; a purely decorative divider is out of scope, and Carbon ships " +
      "$border-subtle below 3:1 for the same reason. Promise: where a border is " +
      "the ONLY thing distinguishing two regions or signalling state, use " +
      "border-strong or border-interactive instead.",
  },
];

export function isExempt(pair: Pair): boolean {
  return EXEMPTIONS.some(
    (e) =>
      (e.variant === undefined || e.variant === pair.variant) &&
      (e.fg === undefined || e.fg === pair.fg) &&
      (e.bg === undefined || e.bg === pair.bg),
  );
}
