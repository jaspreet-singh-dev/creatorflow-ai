"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Zap,
  Youtube,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInDemo, user, isDemoMode, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && !isDemoMode) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, isDemoMode, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await signIn(email, password);
    setIsLoading(false);

    if (signInError) {
      setError(signInError.message || "Invalid login credentials. Please check your email and password.");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLaunchDemo = () => {
    signInDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#030508] text-slate-100 relative overflow-hidden flex flex-col justify-between selection:bg-mint-400/30 selection:text-black">
      {/* Background Kinetic Aurora Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-aurora-grid opacity-60 pointer-events-none" />
      <div className="ambient-glow-mint -top-32 -left-32 opacity-40" />
      <div className="ambient-glow-cyan bottom-0 right-0 opacity-30" />
      <div className="ambient-glow-amber top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15" />

      {/* Top Header Bar */}
      <header className="relative z-20 px-6 lg:px-12 py-5 flex items-center justify-between border-b border-white/[0.06] backdrop-blur-xl bg-[#030508]/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-mint-400 via-teal-400 to-cyber-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <span className="font-black text-xl tracking-tight text-white">
            CreatorFlow <span className="aurora-accent-text">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/signup">
            <Button variant="outline" size="sm" className="text-xs font-bold">
              Create Account
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Dual-Panel Workspace */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ===================================================================
              LEFT PANEL: CREATOR INTELLIGENCE SHOWCASE
              =================================================================== */}
          <div className="lg:col-span-7 space-y-6 text-left hidden md:block">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint-400/10 border border-mint-400/25 text-xs font-bold text-mint-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse" />
              <span>Next-Gen Creator Intelligence v2.0</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                The Autonomous AI Studio for{" "}
                <span className="aurora-accent-text">High-Velocity Creators.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed font-medium">
                Formulate high-CTR titles, 3-second retention hooks, full scripts, and 4K resumable YouTube drops in minutes.
              </p>
            </div>

            {/* Simulated Live Creator Telemetry Card */}
            <div className="aurora-card p-5 space-y-4 max-w-lg">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-mint-400 animate-ping" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Live Channel Sync Telemetry
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-mint-400 bg-mint-400/10 px-2 py-0.5 rounded border border-mint-400/30">
                  Connected: @NoVoiceCraft
                </span>
              </div>

              {/* Sample High-CTR Generation */}
              <div className="p-3.5 rounded-xl bg-[#04060C] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-mint-400/20 text-mint-400 font-mono">
                    SHORTS VIRALITY RADAR
                  </span>
                  <span className="text-xs font-mono font-black text-solar-400">
                    CTR Score: 98/100
                  </span>
                </div>
                <p className="text-xs font-bold text-white line-clamp-1">
                  CAN WATER CAULDRON SAVE ME FROM 1000 BLOCKS?! 💀 #minecraft
                </p>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="w-[98%] bg-gradient-to-r from-mint-400 to-cyber-400 h-full rounded-full" />
                </div>
              </div>

              {/* Features list */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint-400 shrink-0" />
                  <span>3-Sec Pattern Interrupts</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyber-400 shrink-0" />
                  <span>Interactive Shorts Simulator</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-mint-400 shrink-0" />
                  <span>4K Resumable Chunk Uploads</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-solar-400 shrink-0" />
                  <span>Full Version History Diff</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              RIGHT PANEL: AURORA OBSIDIAN AUTH CONSOLE
              =================================================================== */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto space-y-4">
            {/* Instant Demo Sandbox Access Pill */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-mint-400/10 via-cyber-400/10 to-transparent border border-mint-400/30 flex items-center justify-between gap-3 shadow-lg">
              <div className="text-left">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-mint-400" />
                  Want a live test drive?
                </p>
                <p className="text-[11px] text-slate-400">
                  Try the full studio with gaming presets.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleLaunchDemo}
                variant="gradient"
                size="sm"
                className="text-xs h-8 px-3 shrink-0"
              >
                Instant Demo
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {/* The Main Auth Card */}
            <div className="aurora-card p-6 sm:p-7 space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Sign In
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your email to access your CreatorFlow studio & channels.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-300">
                    Creator Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="creator@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Password
                    </label>
                    <Link
                      href="/reset-password"
                      className="text-[11px] text-mint-400 hover:underline font-bold"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full text-xs sm:text-sm h-11"
                  isLoading={isLoading}
                >
                  Sign In to CreatorFlow
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>

              <div className="pt-3 border-t border-white/[0.08] text-center">
                <p className="text-xs text-slate-400">
                  Don&apos;t have an account yet?{" "}
                  <Link href="/signup" className="text-mint-400 hover:underline font-extrabold">
                    Create Account Free
                  </Link>
                </p>
              </div>
            </div>

            {/* Public Trust Links */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 flex-wrap pt-2">
              <Link href="/terms" className="hover:text-mint-400 transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-mint-400 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link href="/refund" className="hover:text-mint-400 transition-colors">Refund</Link>
              <span>•</span>
              <Link href="/security" className="hover:text-mint-400 transition-colors">Security</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-mint-400 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-600 border-t border-white/[0.04]">
        © 2026 CreatorFlow AI. Powered by Hyper-Mint Creator Intelligence.
      </footer>
    </div>
  );
}
