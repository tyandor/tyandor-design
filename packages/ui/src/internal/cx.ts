/**
 * Class-name join. Deliberately not `clsx` — this is the whole of what the
 * package needs, and a design system's dependency list is part of its
 * contract with consumers.
 */
export function cx(...parts: readonly (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
