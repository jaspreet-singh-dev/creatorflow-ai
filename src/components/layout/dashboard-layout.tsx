"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useChannel } from "@/context/channel-context";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { Loader2, Sparkles, Youtube, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const ALLOWED_UNCONNECTED_ROUTES = [
  "/dashboard/channels",
  "/dashboard/settings",
  "/dashboard/help",
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isDemoMode } = useAuth();
  const { channels, isLoadingChannels } = useChannel();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user && !isDemoMode) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, isDemoMode, router, pathname]);

  if (isLoading || (isLoadingChannels && user && !isDemoMode)) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-glow animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-purple" />
            <span>Loading CreatorFlow Studio...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return null; // Will redirect in useEffect
  }

  // Strict YouTube-verified channel access gate
  const isUnconnectedRealUser =
    Boolean(user) &&
    !isDemoMode &&
    !isLoadingChannels &&
    channels.length === 0;

  const isCurrentRouteAllowedWithoutChannel = ALLOWED_UNCONNECTED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  );

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col lg:flex-row text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isUnconnectedRealUser && !isCurrentRouteAllowedWithoutChannel ? (
            <div className="max-w-2xl mx-auto my-8 p-8 rounded-2xl border border-navy-800 bg-navy-900/90 shadow-2xl text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20 shadow-glow">
                <Youtube className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  YouTube Channel Connection Required
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Your CreatorFlow account is verified, but access to the Creator Studio, Analytics, and Publishing pipeline requires linking an authorized YouTube channel.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-navy-800 bg-navy-950 text-xs text-slate-300 text-left space-y-2">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verified YouTube Account Access
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Linking your channel retrieves your channel title, subscriber count, and verified YouTube channel ID so your content packages, analytics, and upload workflows are strictly scoped to your authentic YouTube identity.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/dashboard/channels" className="w-full sm:w-auto">
                  <Button variant="gradient" size="default" className="w-full sm:w-auto font-semibold text-xs shadow-glow">
                    <Youtube className="w-4 h-4 mr-2" />
                    Connect YouTube Channel
                  </Button>
                </Link>
                <Link href="/demo" className="w-full sm:w-auto">
                  <Button variant="outline" size="default" className="w-full sm:w-auto text-xs border-navy-700 bg-navy-900/60">
                    Preview Sandbox Demo
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
