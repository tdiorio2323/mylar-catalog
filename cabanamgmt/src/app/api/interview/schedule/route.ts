import { NextResponse } from "next/server";

export async function POST() {
  // TODO: book via Calendly/Google API
  return NextResponse.json({ ok: true });
}
