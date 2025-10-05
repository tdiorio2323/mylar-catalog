"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import LiquidButton from "@/components/ui/LiquidButton";
import GlassCard from "@/components/ui/GlassCard";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const s = supabaseBrowser();
      const { error } = await s.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const s = supabaseBrowser();
      const { error } = await s.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setResetSent(true);
        toast.success("Password reset email sent!");
      }
    } catch {
      toast.error("Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (forgotMode) {
    return (
      <main className="max-w-md mx-auto space-y-4">
        <GlassCard>
          <h1 className="text-xl font-semibold mb-2">Reset Password</h1>
          {resetSent ? (
            <div className="space-y-3">
              <p className="text-sm opacity-70">
                Check your email for a password reset link.
              </p>
              <button
                onClick={() => {
                  setForgotMode(false);
                  setResetSent(false);
                }}
                className="text-sm opacity-70 hover:opacity-100 underline"
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <p className="text-sm opacity-70 mb-3">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              <input
                type="email"
                className="w-full rounded bg-white/10 p-2 border border-white/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="flex-1 rounded bg-white/10 p-2 hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <LiquidButton type="submit" disabled={loading} className="flex-1">
                  {loading ? "Sending..." : "Send Reset Link"}
                </LiquidButton>
              </div>
            </form>
          )}
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto space-y-4">
      <GlassCard>
        <h1 className="text-xl font-semibold mb-2">Sign in</h1>
        <form onSubmit={handleSignIn} className="space-y-3">
          <div>
            <label className="text-sm opacity-70 mb-1 block">Email</label>
            <input
              type="email"
              className="w-full rounded bg-white/10 p-2 border border-white/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>
          <div>
            <label className="text-sm opacity-70 mb-1 block">Password</label>
            <input
              type="password"
              className="w-full rounded bg-white/10 p-2 border border-white/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setForgotMode(true)}
              className="text-sm opacity-70 hover:opacity-100 underline"
            >
              Forgot password?
            </button>
          </div>
          <LiquidButton type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </LiquidButton>
        </form>
      </GlassCard>
    </main>
  );
}
