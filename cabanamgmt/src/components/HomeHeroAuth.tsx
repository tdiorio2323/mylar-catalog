"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function HomeHeroAuth() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [vipCode, setVipCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!username || !password) {
      toast.error("Enter email and password");
      return;
    }

    setLoading(true);

    try {
      const client = supabaseBrowser();
      const { error } = await client.auth.signInWithPassword({
        email: username,
        password,
      });

      if (error) {
        throw new Error(error.message || "Sign-in failed");
      }

      const trimmedVip = vipCode.trim();

      if (trimmedVip) {
        const response = await fetch("/api/vip/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code: trimmedVip.toUpperCase() }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "VIP code error");
        }
      }

      toast.success(trimmedVip ? "Signed in with VIP" : "Signed in");
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-md"
    >
      <div className="absolute inset-0 -z-10 rounded-[32px] bg-black/40 blur-3xl" />
      <div className="relative overflow-hidden rounded-[32px] border-2 border-white/20 bg-black/30 px-10 py-12 shadow-[0_0_45px_rgba(0,0,0,0.65)] backdrop-blur-lg">
        <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/10" />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-48 rounded-b-full bg-white/15 opacity-60 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center text-white">
          <Image
            src="/cabana-logo.png"
            alt="Cabana"
            width={120}
            height={120}
            className="h-28 w-28 object-contain"
          />
          <div className="space-y-1">
            <div className="font-[family-name:var(--font-script)] text-5xl leading-tight tracking-wide">
              Cabana
            </div>
            <div className="font-[family-name:var(--font-display)] text-sm uppercase tracking-[0.45em] text-white/85">
              Management Group
            </div>
          </div>
          <form onSubmit={submit} className="w-full space-y-5 text-left">
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide text-white" htmlFor="home-username">
                Username (email)
              </label>
              <input
                id="home-username"
                className="h-12 w-full rounded-xl border border-white/30 bg-white/10 px-4 text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none focus:ring-0"
                placeholder="you@domain.com"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide text-white" htmlFor="home-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="home-password"
                  type={showPassword ? "text" : "password"}
                  className="h-12 w-full rounded-xl border border-white/30 bg-white/10 px-4 pr-12 text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none focus:ring-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="relative py-2">
              <div className="pointer-events-none absolute inset-0 flex items-center">
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide text-white" htmlFor="home-vip">
                Admin/VIP Access Code
              </label>
              <input
                id="home-vip"
                className="h-12 w-full rounded-xl border border-white/30 bg-white/10 px-4 text-white placeholder:text-white/60 focus:border-white/60 focus:outline-none focus:ring-0"
                placeholder="Optional access code"
                value={vipCode}
                onChange={(event) => setVipCode(event.target.value.toUpperCase())}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="relative mt-6 flex h-14 w-full items-center justify-center rounded-full border border-white/30 bg-gradient-to-b from-white via-white to-gray-200 text-lg font-semibold uppercase tracking-[0.4em] text-black shadow-[inset_0_2px_10px_rgba(255,255,255,0.9),inset_0_-6px_12px_rgba(0,0,0,0.3),0_12px_24px_rgba(0,0,0,0.45)] transition-all duration-200 hover:shadow-[inset_0_2px_12px_rgba(255,255,255,1),inset_0_-6px_14px_rgba(0,0,0,0.35),0_14px_28px_rgba(0,0,0,0.5)] disabled:cursor-not-allowed disabled:opacity-85"
            >
              <span className="relative z-10">{loading ? "Signing in…" : "Enter"}</span>
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/90 via-white/40 to-transparent" />
            </button>
            <div className="text-center text-xs text-white/80">
              <a
                href="/login"
                className="underline underline-offset-4 transition hover:text-white"
              >
                Request Access
              </a>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.57 18.57 0 0 1 5.06-5.94" />
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}
