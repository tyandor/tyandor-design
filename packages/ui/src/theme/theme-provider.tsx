"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_STORAGE_KEY, type ResolvedTheme, type Theme } from "./theme-script.ts";

export interface ThemeContextValue {
  /** What the user chose — may be "system". */
  theme: Theme;
  /** What that actually renders as right now. */
  resolved: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStored(storageKey: string): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const v = window.localStorage.getItem(storageKey);
    return v === "mcrn" || v === "earth" ? v : "system";
  } catch {
    // Safari in private mode throws on localStorage access rather than
    // returning null. A theme preference is not worth a blank page.
    return "system";
  }
}

/**
 * Write the choice to the document and report what it resolves to.
 *
 * "system" REMOVES data-theme rather than setting it to a resolved value.
 * That is the whole mechanism: tokens.css guards its prefers-color-scheme
 * block with `:root:not([data-theme])`, so an absent attribute hands
 * control to the media query and a present one takes it back. Setting
 * data-theme="mcrn" on system would pin the theme and silently stop
 * tracking the OS.
 */
function apply(theme: Theme): ResolvedTheme {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "earth" : "mcrn";
  }
  root.setAttribute("data-theme", theme);
  return theme;
}

export interface ThemeProviderProps {
  children?: ReactNode;
  /** localStorage key. Override only to avoid a collision with an existing store. */
  storageKey?: string;
}

/**
 * Three-way theme state: mcrn / earth / system.
 *
 * Renders as "system" on the server and on first client render, then
 * corrects in an effect — localStorage is not readable during SSR, and
 * guessing would produce a hydration mismatch. The visible flash this would
 * otherwise cause is handled before React runs, by `themeScript`.
 */
export function ThemeProvider({ children, storageKey = DEFAULT_STORAGE_KEY }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("mcrn");

  useEffect(() => {
    const initial = readStored(storageKey);
    setThemeState(initial);
    setResolved(apply(initial));

    // Track OS-level flips, but only while the user is actually on "system".
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (readStored(storageKey) === "system") setResolved(media.matches ? "earth" : "mcrn");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [storageKey]);

  const setTheme = useCallback(
    (next: Theme) => {
      try {
        if (next === "system") window.localStorage.removeItem(storageKey);
        else window.localStorage.setItem(storageKey, next);
      } catch {
        // Private mode: the choice still applies for this session.
      }
      setThemeState(next);
      setResolved(apply(next));
    },
    [storageKey],
  );

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
