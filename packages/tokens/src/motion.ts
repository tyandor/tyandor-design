/**
 * Carbon motion tokens (PLAN.md 1d).
 *
 * `productive` motion is for anything the user is waiting on — it stays out
 * of the way. `expressive` is for moments that deserve a beat (dialogs,
 * page-level transitions).
 */
export const easing = {
  "standard-productive": "cubic-bezier(0.2, 0, 0.38, 0.9)",
  "standard-expressive": "cubic-bezier(0.4, 0.14, 0.3, 1)",
  "entrance-productive": "cubic-bezier(0, 0, 0.38, 0.9)",
  "entrance-expressive": "cubic-bezier(0, 0, 0.3, 1)",
  "exit-productive": "cubic-bezier(0.2, 0, 1, 0.9)",
  "exit-expressive": "cubic-bezier(0.4, 0.14, 1, 1)",
} as const;

export const duration = {
  "fast-01": "70ms",      // micro-interactions: checkbox, toggle
  "fast-02": "110ms",     // button hover, small fades
  "moderate-01": "150ms", // productive ceiling
  "moderate-02": "240ms",
  "slow-01": "400ms",     // expressive: dialog entrance
  "slow-02": "700ms",     // large expressive surfaces
} as const;

/**
 * Elevation. On MCRN, depth is layer colour + `border-subtle`, not shadow —
 * a shadow on a #050910 page is invisible anyway. Shadows are therefore
 * defined for Earth only and resolve to `none` on MCRN.
 */
export const shadow = {
  "01": { mcrn: "none", earth: "0 1px 2px 0 rgba(42, 58, 74, 0.08)" },
  "02": { mcrn: "none", earth: "0 2px 6px -1px rgba(42, 58, 74, 0.10), 0 1px 2px -1px rgba(42, 58, 74, 0.06)" },
  "03": { mcrn: "none", earth: "0 8px 24px -4px rgba(42, 58, 74, 0.12), 0 2px 6px -2px rgba(42, 58, 74, 0.08)" },
} as const;
