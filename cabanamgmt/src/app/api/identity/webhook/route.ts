import { NextResponse } from "next/server";

export async function POST() {
  // verify signature if provided; update booking idv status
  return NextResponse.json({ ok: true });
}
