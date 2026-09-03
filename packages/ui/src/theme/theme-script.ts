/**
 * Theme identity and the pre-hydration script.
 *
 * Deliberately NOT in theme-provider.tsx. "use client" marks a whole
 * module, not individual exports, so anything sharing a file with the
 * provider becomes unreachable from a server component — and this script's
 * entire job is to be server-rendered into <head>, ahead of hydration.
 */

/** The two themes, plus deference to the OS. */
export type Theme = "mcrn" | "earth" | "system";

/** What a Theme actually renders as once "system" is resolved. */
export type ResolvedTheme = "mcrn" | "earth";

export const DEFAULT_STORAGE_KEY = "ty-theme";

/**
 * Blocking script for <head>, ahead of first paint.
 *
 * Without it a returning visitor on Earth gets a frame of MCRN before
 * hydration corrects it — the classic dark-mode flash, in reverse. It has
 * to be synchronous and inline: anything deferred runs *after* the first
 * paint, which is exactly the frame being fixed.
 *
 * Note it only ever SETS data-theme, never removes it. "system" is encoded
 * as the absence of the attribute, which is also the document's initial
 * state, so there is nothing to undo.
 */
export function themeScript(storageKey: string = DEFAULT_STORAGE_KEY): string {
  return `(function(){try{var v=localStorage.getItem(${JSON.stringify(storageKey)});if(v==="mcrn"||v==="earth")document.documentElement.setAttribute("data-theme",v)}catch(e){}})()`;
}
