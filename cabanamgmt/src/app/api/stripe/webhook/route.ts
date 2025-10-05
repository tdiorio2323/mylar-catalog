import { NextResponse } from "next/server";

export async function POST() {
  // TODO: validate signature, update deposit status
  return NextResponse.json({ received: true });
}
