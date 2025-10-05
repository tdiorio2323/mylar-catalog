"use client";
import { useBooking } from "@/lib/store";
import { useEffect, useState } from "react";

export default function DepositForm(){
  const set = useBooking((s)=>s.set);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const r = await fetch("/api/stripe/create-deposit", { method: "POST", body: JSON.stringify({ amount: 20000 }) });
    const res = await r.json();
    set({ deposit: { status: "paid", intentId: res.intentId } });
    // trigger background check
    await fetch("/api/screening/start", { method: "POST" });
    location.href = "/screening";
  };

  useEffect(()=>{ /* inject Stripe Elements in real build */ },[]);

  return (
    <div className="space-y-3">
      <p className="text-sm">Deposit holds your slot. Refunded if screening fails. Forfeited on no-show or policy breach.</p>
      <button disabled={loading} onClick={submit} className="rounded bg-white px-4 py-2 text-black">Pay $200 Deposit</button>
    </div>
  );
}
