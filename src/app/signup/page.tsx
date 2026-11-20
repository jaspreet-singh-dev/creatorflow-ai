"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password, fullName);
    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message || "Failed to create account. Please check your details.");
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-950 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">CreatorFlow <span className="text-brand-purple">AI</span></span>
          </Link>
          <p className="text-sm text-slate-400">
            Create your account to unlock AI-powered YouTube automation.
          </p>
        </div>

        <Card className="border-navy-800 bg-navy-900/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg text-white">Create Creator Account</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Start with the Free plan — upgrade whenever your channels scale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="p-6 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-white text-base">Account Created Successfully!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Welcome to CreatorFlow AI, <strong className="text-white">{fullName || email}</strong>! Your creator workspace is ready.
                </p>
                <Button
                  variant="gradient"
                  className="w-full text-xs font-semibold shadow-glow"
                  onClick={() => router.push("/dashboard")}
                >
                  Enter Dashboard Now
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Creator or Agency Name</label>
                  <Input
                    type="text"
                    placeholder="Alex Rivera"
                    icon={<User className="w-4 h-4" />}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <Input
                    type="password"
                    placeholder="Min 6 characters"
                    icon={<Lock className="w-4 h-4" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full text-sm font-semibold"
                  isLoading={isLoading}
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t border-navy-800/80 pt-4">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-purple hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
