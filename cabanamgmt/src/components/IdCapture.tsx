"use client";
import { useState } from "react";
import { useBooking } from "@/lib/store";

export default function IdCapture(){
  const set = useBooking((s)=>s.set);
  const [front, setFront] = useState<string|undefined>();
  const [selfie, setSelfie] = useState<string|undefined>();

  const submit = async () => {
    // upload to Supabase or vendor SDK; here we just stub
    const r = await fetch("/api/identity/start", { method: "POST", body: JSON.stringify({ front, selfie }) });
    const res = await r.json();
    set({ idv: { status: "pending", ref: res.ref } });
    location.href = "/deposit";
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm">License Front</label>
        <input type="file" accept="image/*" onChange={async (e)=>{
          const f = e.target.files?.[0];
          if(!f) return;
          const url = URL.createObjectURL(f);
          setFront(url);
        }} />
      </div>
      <div>
        <label className="text-sm">Selfie</label>
        <input type="file" accept="image/*" onChange={(e)=>{
          const f = e.target.files?.[0];
          if(!f) return;
          const url = URL.createObjectURL(f);
          setSelfie(url);
        }} />
      </div>
      <button onClick={submit} className="rounded bg-white px-4 py-2 text-black">Continue</button>
    </div>
  );
}
