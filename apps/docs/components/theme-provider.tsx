"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "mcrn" | "earth" | "system";

const STORAGE_KEY = "ty-theme";

interface ThemeContextValue {
  theme: Theme;
  resolved: "mcrn" | "earth";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readInitial(): Theme {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "mcrn" || v === "earth" ? v : "system";
}

function apply(theme: Theme): "mcrn" | "earth" {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "earth" : "mcrn";
  }
  root.setAttribute("data-theme", theme);
  return theme;
}

/**
 * The three-way switch tokens.css was designed for: mcrn / earth / system.
 * System removes data-theme entirely so tokens.css's prefers-color-scheme
 * block takes over; the explicit modes set data-theme and win over media.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"mcrn" | "earth">("mcrn");

  useEffect(() => {
    const initial = readInitial();
    setThemeState(initial);
    setResolved(apply(initial));

    // If the user is on "system", track OS-level theme flips live.
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const current = readInitial();
      if (current === "system") setResolved(media.matches ? "earth" : "mcrn");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    if (t === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
    setResolved(apply(t));
  }, []);

  return <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/**
 * Inline script string. Placed in <head> before body renders, it reads the
 * stored preference and sets data-theme *before* React hydrates, so there
 * is no light-to-dark flash on the first paint for returning visitors.
 */
export const themeInitScript = `(function(){try{var v=localStorage.getItem("${STORAGE_KEY}");if(v==="mcrn"||v==="earth")document.documentElement.setAttribute("data-theme",v);}catch(e){}})();`;
