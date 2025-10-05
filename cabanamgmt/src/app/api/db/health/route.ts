import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { error } = await supabaseAdmin.from("users").select("id").limit(1);
  return NextResponse.json({ ok: !error, error: error?.message });
}
