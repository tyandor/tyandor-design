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

// TODO(policy): fill in — see the decision written up in the session notes.
export const EXEMPTIONS: Exemption[] = [];

export function isExempt(pair: Pair): boolean {
  return EXEMPTIONS.some(
    (e) =>
      (e.variant === undefined || e.variant === pair.variant) &&
      (e.fg === undefined || e.fg === pair.fg) &&
      (e.bg === undefined || e.bg === pair.bg),
  );
}
