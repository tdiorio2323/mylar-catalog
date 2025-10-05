import { NextResponse } from "next/server";

export async function POST() {
  // TODO: call Checkr/Certn; return polling status for wireframe purposes
  const statusPool = ["pending","pending","clear"]; // fake progression
  const idx = Math.floor(Math.random()*statusPool.length);
  return NextResponse.json({ status: statusPool[idx], ref: `scr_${Date.now()}` });
}
