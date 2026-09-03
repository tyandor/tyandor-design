"use client";

import { cx } from "../internal/cx.ts";
import { useTheme } from "./theme-provider.tsx";
import type { Theme } from "./theme-script.ts";

const options: readonly { value: Theme; label: string; short: string }[] = [
  { value: "mcrn", label: "MCRN — dark", short: "MCRN" },
  { value: "earth", label: "Earth — light", short: "Earth" },
  { value: "system", label: "System — follow OS", short: "Auto" },
];

export interface ThemeToggleProps {
  className?: string;
}

/**
 * Three-position segmented control.
 *
 * A control rather than a dropdown because both explicit themes are
 * first-class in this system — hiding Earth behind a menu would understate
 * it. Uses radiogroup semantics: the three options are mutually exclusive
 * views of one setting, which is what a radio group means; a toolbar of
 * buttons would announce them as three unrelated actions.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Theme" className={cx("ty-theme-toggle", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          aria-label={option.label}
          onClick={() => setTheme(option.value)}
          className="ty-theme-toggle__option ty-focus-ring ty-transition"
        >
          {option.short}
        </button>
      ))}
    </div>
  );
}
