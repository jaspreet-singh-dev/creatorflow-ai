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
  Activity,
  Zap,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useChannel } from "@/context/channel-context";

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
    group: "Studio Core",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "AI Studio", href: "/dashboard/create", icon: Sparkles, badge: "NEW" },
      { name: "Video Projects", href: "/dashboard/projects", icon: Layers },
      { name: "Publish Pipeline", href: "/dashboard/publish", icon: UploadCloud },
      { name: "Content Calendar", href: "/dashboard/calendar", icon: Calendar },
    ],
  },
  {
    group: "AI Tools",
    items: [
      { name: "Idea Generator", href: "/dashboard/assistant", icon: Lightbulb },
      { name: "Title & SEO Kit", href: "/dashboard/metadata", icon: FileText },
      { name: "Description Studio", href: "/dashboard/descriptions", icon: Sparkles },
      { name: "Thumbnail Canvas", href: "/dashboard/thumbnails", icon: ImageIcon },
    ],
  },
  {
    group: "YouTube Live",
    items: [
      { name: "Channel Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { name: "Connected Channels", href: "/dashboard/channels", icon: Youtube },
      { name: "Channel Videos", href: "/dashboard/videos", icon: Film },
    ],
  },
  {
    group: "Account",
    items: [
      { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
      { name: "Settings & API Keys", href: "/dashboard/settings", icon: Settings },
      { name: "Help & Support", href: "/dashboard/help", icon: HelpCircle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activeChannel } = useChannel();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-white/[0.08] bg-[#030508]/95 backdrop-blur-2xl min-h-screen shrink-0 sticky top-0 h-screen select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06] gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-mint-400 via-teal-400 to-cyber-400 flex items-center justify-center shadow-glow">
          <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-base tracking-tight text-white">CreatorFlow</span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.2 bg-mint-400/20 text-mint-400 rounded-md border border-mint-400/30">
              v2.0
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">YouTube Intelligence OS</span>
        </div>
      </div>

      {/* Channel Status Telemetry Capsule */}
      <div className="p-3 border-b border-white/[0.06] bg-void-900/60">
        <div className="p-2.5 rounded-xl bg-[#070B14] border border-white/[0.08] flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold text-[11px] shrink-0 border border-white/20">
                {activeChannel?.title?.[0]?.toUpperCase() || "N"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-mint-400 border-2 border-[#070B14] animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {activeChannel?.title || "NoVoiceCraft"}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                {activeChannel?.subscriber_count ? `${formatNumber(activeChannel.subscriber_count)} subs` : "335 subs"}
              </p>
            </div>
          </div>
          <Link href="/dashboard/channels">
            <span className="text-[10px] font-bold text-mint-400 hover:text-white bg-mint-400/10 hover:bg-mint-400/20 px-2 py-0.5 rounded border border-mint-400/30 transition-colors shrink-0">
              Sync
            </span>
          </Link>
        </div>
      </div>

      {/* Navigation Links with Neon Rail Indicator */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.group} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-mint-400/60" />
              <span>{group.group}</span>
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
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all group relative",
                    isActive
                      ? "border-l-[3px] border-mint-400 bg-gradient-to-r from-mint-400/15 via-mint-400/5 to-transparent text-white font-extrabold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04] font-medium"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0",
                        isActive
                          ? "bg-mint-400 text-black shadow-glow"
                          : "bg-void-850 text-slate-400 group-hover:text-mint-400 border border-white/[0.06]"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "text-[9px] font-black px-1.5 py-0.2 rounded shrink-0",
                        isActive
                          ? "bg-mint-400 text-black"
                          : "bg-mint-400/20 text-mint-400 border border-mint-400/30"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Live System Telemetry */}
      <div className="p-3 border-t border-white/[0.06] bg-[#020408]">
        <div className="rounded-xl bg-[#060912] border border-white/[0.08] p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-mint-400" />
              YouTube Data API v3
            </span>
            <span className="text-[10px] text-mint-400 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse" />
              100% Active
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="w-full bg-gradient-to-r from-mint-400 to-cyber-400 h-full rounded-full" />
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Resumable chunked upload protocol ready.
          </p>
        </div>
      </div>
    </aside>
  );
}
