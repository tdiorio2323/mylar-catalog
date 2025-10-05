import { NextResponse } from "next/server";

export async function POST() {
  // receive CRA webhook; update record
  return NextResponse.json({ ok: true });
}
