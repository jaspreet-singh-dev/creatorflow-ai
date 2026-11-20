"use client";

import React, { useState } from "react";
import { ChannelSwitcher } from "./channel-switcher";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Bell,
  Menu,
  X,
  Plus,
  Sparkles,
  Upload,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "./sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const { isDemoMode } = useAuth();

  return (
    <header className="h-16 border-b border-navy-800 bg-navy-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Channel Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2">
          <ChannelSwitcher />
        </div>
      </div>

      {/* Right: Quick Actions, Notifications, User */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {isDemoMode && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Interactive Demo Sandbox</span>
          </div>
        )}

        <Link href="/dashboard/metadata">
          <Button
            size="sm"
            variant="gradient"
            className="hidden sm:inline-flex gap-1.5 text-xs font-semibold px-3 h-8 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Studio</span>
          </Button>
        </Link>

        <Link href="/dashboard/uploads">
          <Button
            size="sm"
            variant="outline"
            className="hidden sm:inline-flex gap-1.5 text-xs font-medium px-3 h-8"
          >
            <Upload className="w-3.5 h-3.5 text-brand-purple" />
            <span>Upload</span>
          </Button>
        </Link>

        {/* Theme Switcher Toggle (Light / Dark Navy / AMOLED) */}
        <ThemeToggle />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-purple" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-navy-800 bg-navy-900 shadow-2xl backdrop-blur-md z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                <span className="text-xs font-semibold text-white">Notifications</span>
                <span className="text-[10px] text-slate-400">2 unread</span>
              </div>
              <div className="space-y-2 py-2">
                <div className="p-2 rounded-lg bg-navy-800/40 border border-navy-800 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Upload Published</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    &quot;10 Proven AI Prompts for 2026&quot; published to YouTube successfully.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">12 mins ago</span>
                </div>
                <div className="p-2 rounded-lg bg-navy-800/40 border border-navy-800 text-xs">
                  <div className="flex items-center gap-1.5 text-brand-purple font-medium text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    <span>Metadata Optimized</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    High SEO score (94/100) generated for upcoming series episode.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-navy-800 mx-0.5" />

        {/* User Navigation Menu */}
        <UserNav />
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-navy-950/95 backdrop-blur-lg lg:hidden p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {NAVIGATION_ITEMS.map((section) => (
              <div key={section.category} className="space-y-1.5">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.category}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-navy-800 text-white font-semibold border border-navy-700"
                            : "text-slate-300 hover:bg-navy-900"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn("w-4 h-4", isActive ? "text-brand-purple" : "text-slate-400")} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-purple/20 text-brand-purple">
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

          <div className="pt-6 border-t border-navy-800 space-y-4">
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Appearance Theme</p>
              <ThemeToggle variant="segmented" />
            </div>

            <Link
              href="/dashboard/metadata"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white font-semibold text-sm shadow-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Studio</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
