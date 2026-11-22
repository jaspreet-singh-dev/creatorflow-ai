"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { LogOut, User as UserIcon, CreditCard, Sparkles, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user, profile, signOut, isDemoMode } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Creator";
  const planTier = profile?.plan_tier || "creator";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 rounded-full border border-navy-800 bg-navy-900 hover:bg-navy-850 hover:border-navy-700 transition-colors"
      >
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden lg:inline-block max-w-[120px] truncate">
          {displayName}
        </span>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-xs font-semibold text-brand-purple">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-navy-800 bg-navy-900 shadow-xl backdrop-blur-md z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-2.5 border-b border-navy-800">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{displayName}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider">
                {planTier} PLAN
              </Badge>
              {isDemoMode && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-300 border border-amber-500/20 font-medium">
                  Demo
                </span>
              )}
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard/subscription"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-navy-800 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Subscription & Plans</span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-navy-800 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Account Settings</span>
            </Link>
          </div>

          <div className="border-t border-navy-800 pt-1 mt-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors w-full text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
