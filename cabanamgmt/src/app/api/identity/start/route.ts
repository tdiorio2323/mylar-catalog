import { NextResponse } from "next/server";

export async function POST() {
  // TODO: call Onfido/Veriff; create applicant and check
  const ref = `idv_${Date.now()}`;
  return NextResponse.json({ ref, status: "pending" });
}
