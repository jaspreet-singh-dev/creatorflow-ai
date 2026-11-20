"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "dark" | "amoled" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("cf_theme") as Theme | null;
    if (saved && (saved === "dark" || saved === "amoled" || saved === "light")) {
      setThemeState(saved);
      applyThemeToDOM(saved);
    } else {
      applyThemeToDOM("dark");
    }
  }, []);

  const applyThemeToDOM = (selectedTheme: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", selectedTheme);

    // Sync Tailwind classes
    root.classList.remove("light", "dark", "amoled");
    if (selectedTheme === "light") {
      root.classList.add("light");
    } else if (selectedTheme === "amoled") {
      root.classList.add("dark", "amoled");
    } else {
      root.classList.add("dark");
    }
  };

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("cf_theme", newTheme);
    applyThemeToDOM(newTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      let next: Theme;
      if (prev === "dark") next = "amoled";
      else if (prev === "amoled") next = "light";
      else next = "dark";
      localStorage.setItem("cf_theme", next);
      applyThemeToDOM(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
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
