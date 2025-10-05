import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest){
  const { amount } = await req.json();
  const intent = await stripe.paymentIntents.create({ amount, currency: "usd", capture_method: "automatic", metadata: { purpose: "deposit" } });
  return NextResponse.json({ intentId: intent.id, clientSecret: intent.client_secret });
}
