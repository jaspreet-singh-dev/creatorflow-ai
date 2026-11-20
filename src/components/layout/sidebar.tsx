"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Image as ImageIcon,
  UploadCloud,
  Calendar,
  Youtube,
  BarChart3,
  Lightbulb,
  CreditCard,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAVIGATION_ITEMS = [
  {
    category: "Workspace",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Metadata Studio", href: "/dashboard/metadata", icon: Sparkles, badge: "AI" },
      { name: "Thumbnail Studio", href: "/dashboard/thumbnails", icon: ImageIcon },
      { name: "Upload Manager", href: "/dashboard/uploads", icon: UploadCloud },
      { name: "Content Calendar", href: "/dashboard/calendar", icon: Calendar },
    ],
  },
  {
    category: "Growth & Intelligence",
    items: [
      { name: "Channel Manager", href: "/dashboard/channels", icon: Youtube },
      { name: "Analytics Dashboard", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Content Assistant", href: "/dashboard/assistant", icon: Lightbulb, badge: "AI" },
    ],
  },
  {
    category: "Management",
    items: [
      { name: "Subscription & Limits", href: "/dashboard/subscription", icon: CreditCard },
      { name: "Settings & API Keys", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-navy-800 bg-navy-950/95 min-h-screen shrink-0 sticky top-0 h-screen select-none">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-navy-800 gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-glow">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">CreatorFlow</span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-brand-purple/20 text-brand-purple rounded border border-brand-purple/30">
              AI
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">YouTube Workspace</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {NAVIGATION_ITEMS.map((section) => (
          <div key={section.category} className="space-y-1.5">
            <h4 className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.category}
            </h4>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                      isActive
                        ? "bg-navy-800/90 text-white font-semibold border border-navy-700/80 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-navy-900/60"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-brand-purple"
                            : "text-slate-400 group-hover:text-slate-300"
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-navy-800 bg-navy-900/30">
        <div className="rounded-lg bg-navy-900/80 border border-navy-800 p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-200">YouTube Quota</span>
            <span className="text-[10px] text-emerald-400 font-mono">Healthy</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Data API v3 & Analytics connected via secure OAuth 2.0.
          </p>
        </div>
      </div>
    </aside>
  );
}
