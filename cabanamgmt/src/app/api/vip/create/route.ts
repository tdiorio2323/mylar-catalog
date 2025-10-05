import { NextRequest, NextResponse } from "next/server";

import { generateCode } from "@/lib/crypto";
import { isAdminEmail } from "@/lib/isAdminEmail";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseServer } from "@/lib/supabaseServer";

const ALLOWED_ROLES = new Set(["admin", "creator", "client"]);

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const customCode = typeof body.code === "string" && body.code.trim().length > 0 ? body.code.trim().toUpperCase() : null;
  const code =
    customCode ??
    [generateCode(4), generateCode(4), generateCode(4)]
      .join("-")
      .toUpperCase();

  const roleCandidate = typeof body.role === "string" ? body.role.toLowerCase() : "";
  const role = ALLOWED_ROLES.has(roleCandidate) ? roleCandidate : "client";

  const usesAllowed = Number(body.uses_allowed ?? 5);
  const expiresAt =
    typeof body.expires_at === "string" && !Number.isNaN(Date.parse(body.expires_at))
      ? body.expires_at
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("vip_codes")
    .insert({
      code,
      role,
      uses_allowed: usesAllowed,
      uses_remaining: usesAllowed,
      expires_at: expiresAt,
      created_by: session.user.id,
      metadata: (body.metadata as Record<string, unknown>) ?? {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ code: data });
}
