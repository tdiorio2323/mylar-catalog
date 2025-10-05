import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
  const s = await supabaseServer();
  const { error } = await s.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=exchange_failed", req.url));
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
