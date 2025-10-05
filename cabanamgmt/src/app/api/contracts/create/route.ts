import { NextResponse } from "next/server";

export async function POST() {
  // TODO: create DocuSign envelope; redirect URL
  return NextResponse.json({ ok: true, redirectUrl: "/confirmation" });
}
