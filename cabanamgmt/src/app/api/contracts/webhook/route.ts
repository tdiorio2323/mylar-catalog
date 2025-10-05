import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // TODO: verify DocuSign signature
    const bookingId = body?.envelopeSummary?.booking_id;
    if (bookingId) {
      await supabaseAdmin.from("bookings").update({ nda_signed: true }).eq("id", bookingId);
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "fail";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
