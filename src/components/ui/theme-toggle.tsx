"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme } from "@/context/theme-context";
import { Moon, Sun, Monitor, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeOption {
  id: Theme;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    sublabel: "Crisp daylight workspace",
    icon: Sun,
    accentColor: "text-amber-500 bg-amber-500/10",
  },
  {
    id: "dark",
    label: "Dark (AMOLED)",
    sublabel: "Pure #000000 OLED black",
    icon: Moon,
    accentColor: "text-purple-400 bg-purple-500/10",
  },
  {
    id: "system",
    label: "System",
    sublabel: "Match device theme",
    icon: Monitor,
    accentColor: "text-blue-400 bg-blue-500/10",
  },
];

export function ThemeToggle({ variant = "dropdown" }: { variant?: "dropdown" | "cycle" | "segmented" }) {
  const { theme, setTheme, cycleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = THEME_OPTIONS.find((o) => o.id === theme) || THEME_OPTIONS[1];
  const CurrentIcon = currentOption.icon;

  if (variant === "cycle") {
    return (
      <button
        onClick={cycleTheme}
        className="p-2 rounded-lg border border-navy-800 bg-navy-900 hover:bg-navy-850 hover:border-navy-700 text-slate-300 hover:text-white transition-all shadow-sm flex items-center gap-1.5 text-xs"
        title={`Current: ${currentOption.label}. Click to cycle theme.`}
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-4 h-4 text-brand-purple" />
        <span className="hidden sm:inline-block font-medium">{currentOption.label}</span>
      </button>
    );
  }

  if (variant === "segmented") {
    return (
      <div className="inline-flex p-1 rounded-xl bg-navy-950 border border-navy-800 gap-1">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                isSelected
                  ? "bg-brand-purple text-white shadow-glow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-navy-900"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-lg border border-navy-800 bg-navy-900 hover:bg-navy-850 hover:border-navy-700 text-slate-700 dark:text-slate-300 transition-all text-xs font-medium"
        aria-label="Theme selector"
        title={`Theme: ${currentOption.label}`}
      >
        <span className={cn("w-5 h-5 rounded-md flex items-center justify-center", currentOption.accentColor)}>
          <CurrentIcon className="w-3.5 h-3.5" />
        </span>
        <span className="hidden sm:inline-block text-slate-800 dark:text-slate-200 font-medium">
          {currentOption.label}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-navy-800 bg-navy-900 shadow-2xl backdrop-blur-md z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 border-b border-navy-800/80 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Appearance
            </p>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left",
                    isSelected
                      ? "bg-brand-purple/15 text-brand-purple dark:text-white font-semibold border border-brand-purple/30"
                      : "text-slate-700 dark:text-slate-300 hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn("w-6 h-6 rounded-md flex items-center justify-center", opt.accentColor)}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="leading-tight font-medium text-slate-900 dark:text-slate-100">{opt.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{opt.sublabel}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-purple shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
