"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const applyThemeToDOM = useCallback((selectedTheme: Theme) => {
    if (typeof document === "undefined") return;
    const effectiveTheme: "light" | "dark" =
      selectedTheme === "system" ? getSystemTheme() : selectedTheme;

    setResolvedTheme(effectiveTheme);

    const root = document.documentElement;
    if (effectiveTheme === "light") {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark", "amoled");
      root.classList.add("light");
    } else {
      root.setAttribute("data-theme", "amoled");
      root.classList.remove("light");
      root.classList.add("dark", "amoled");
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("cf_theme") as string | null;
    let initialTheme: Theme = "dark";
    if (saved === "light" || saved === "dark" || saved === "system") {
      initialTheme = saved;
    } else if (saved === "amoled") {
      initialTheme = "dark";
    }
    setThemeState(initialTheme);
    applyThemeToDOM(initialTheme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = localStorage.getItem("cf_theme") as Theme | null;
      if (current === "system") {
        applyThemeToDOM("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyThemeToDOM]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem("cf_theme", newTheme);
      } catch {
        // ignore
      }
      applyThemeToDOM(newTheme);
    },
    [applyThemeToDOM]
  );

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      let next: Theme;
      if (prev === "system") next = "dark";
      else if (prev === "dark") next = "light";
      else next = "system";

      try {
        localStorage.setItem("cf_theme", next);
      } catch {
        // ignore
      }
      applyThemeToDOM(next);
      return next;
    });
  }, [applyThemeToDOM]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
