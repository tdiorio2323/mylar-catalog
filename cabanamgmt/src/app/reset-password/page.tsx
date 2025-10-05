"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import LiquidButton from "@/components/ui/LiquidButton";
import GlassCard from "@/components/ui/GlassCard";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Check if user has a valid session from the reset email
    const checkSession = async () => {
      const s = supabaseBrowser();
      const { data } = await s.auth.getSession();
      setValidSession(!!data.session);

      if (!data.session) {
        toast.error("Invalid or expired reset link");
        setTimeout(() => router.push("/login"), 2000);
      }
    };

    checkSession();
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const s = supabaseBrowser();
      const { error } = await s.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } catch {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!validSession) {
    return (
      <main className="max-w-md mx-auto space-y-4">
        <GlassCard>
          <p className="text-center opacity-70">Validating reset link...</p>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto space-y-4">
      <GlassCard>
        <h1 className="text-xl font-semibold mb-2">Set New Password</h1>
        <form onSubmit={handleResetPassword} className="space-y-3">
          <div>
            <label className="text-sm opacity-70 mb-1 block">New Password</label>
            <input
              type="password"
              className="w-full rounded bg-white/10 p-2 border border-white/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
            <p className="text-xs opacity-50 mt-1">At least 8 characters</p>
          </div>
          <div>
            <label className="text-sm opacity-70 mb-1 block">Confirm Password</label>
            <input
              type="password"
              className="w-full rounded bg-white/10 p-2 border border-white/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          <LiquidButton type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </LiquidButton>
        </form>
      </GlassCard>
    </main>
  );
}
