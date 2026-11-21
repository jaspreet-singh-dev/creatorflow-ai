"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  UploadCloud,
  BarChart3,
  Settings,
  ChevronRight,
  Layers,
  Calendar,
  Image as ImageIcon,
  Lightbulb,
  CreditCard,
  Youtube,
  Film,
  HelpCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  matchPrefix?: boolean;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAVIGATION_GROUPS: NavGroup[] = [
  {
    group: "Workspace",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Creator Studio", href: "/dashboard/create", icon: Sparkles, badge: "AI" },
      { name: "My Projects", href: "/dashboard/projects", icon: Layers },
      { name: "Content Calendar", href: "/dashboard/calendar", icon: Calendar },
    ],
  },
  {
    group: "AI Tools",
    items: [
      { name: "Idea Generator", href: "/dashboard/assistant", icon: Lightbulb },
      { name: "Title & SEO Studio", href: "/dashboard/metadata", icon: FileText },
      { name: "Description Studio", href: "/dashboard/descriptions", icon: Sparkles },
      { name: "Thumbnail Studio", href: "/dashboard/thumbnails", icon: ImageIcon },
    ],
  },
  {
    group: "YouTube",
    items: [
      { name: "Connected Channels", href: "/dashboard/channels", icon: Youtube },
      { name: "Channel Videos", href: "/dashboard/videos", icon: Film },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Uploads & Publishing", href: "/dashboard/publish", icon: UploadCloud },
    ],
  },
  {
    group: "Account",
    items: [
      { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
      { name: "Settings & Keys", href: "/dashboard/settings", icon: Settings },
      { name: "Help & Support", href: "/dashboard/help", icon: HelpCircle },
    ],
  },
];

// Flat export for compatibility
export const CONSOLIDATED_NAV_ITEMS = NAVIGATION_GROUPS.flatMap((g) =>
  g.items.map((item) => ({
    name: item.name,
    href: item.href,
    icon: item.icon,
    badge: item.badge,
    subHrefs: [item.href],
  }))
);

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
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">CreatorFlow</span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-brand-purple/20 text-brand-purple rounded border border-brand-purple/30">
              AI
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">YouTube Workspace</span>
        </div>
      </div>

      {/* 4 Categorized Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.group} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {group.group}
            </div>
            {group.items.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group",
                    isActive
                      ? "bg-navy-800 text-slate-900 dark:text-white border border-navy-700 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-navy-900/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0",
                        isActive
                          ? "bg-brand-purple text-white shadow-glow"
                          : "bg-navy-900 text-slate-400 group-hover:text-slate-200 border border-navy-800"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/30 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info: YouTube Connection Snapshot */}
      <div className="p-4 border-t border-navy-800 bg-navy-900/30">
        <div className="rounded-xl bg-navy-900/80 border border-navy-800 p-3 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-200">YouTube Data API</span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Multi-channel OAuth & resumable publishing active.
          </p>
        </div>
      </div>
    </aside>
  );
}
