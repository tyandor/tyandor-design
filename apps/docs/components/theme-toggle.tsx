"use client";

import { useTheme, type Theme } from "./theme-provider";

const options: readonly { value: Theme; label: string; short: string }[] = [
  { value: "mcrn", label: "MCRN — dark", short: "MCRN" },
  { value: "earth", label: "Earth — light", short: "Earth" },
  { value: "system", label: "System — auto", short: "Auto" },
];

/**
 * A three-position readout: MCRN / Earth / Auto. Kept as a segmented
 * control rather than a dropdown because both explicit modes are equally
 * important to the design system — hiding one under a menu understates
 * the earth theme.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex items-center gap-0 rounded-sm border border-border-subtle bg-layer-01 p-0.5 font-mono text-[11px] tracking-wider uppercase"
    >
      {options.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(o.value)}
            className={
              "px-2.5 py-1 transition-colors " +
              (active
                ? "bg-interactive text-text-on-color"
                : "text-text-secondary hover:text-text-primary")
            }
          >
            {o.short}
          </button>
        );
      })}
    </div>
  );
}
