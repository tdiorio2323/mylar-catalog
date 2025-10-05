"use client";
import { useEffect, useState } from "react";

export default function StatusPanel(){
  const [status, setStatus] = useState<"pending"|"clear"|"consider"|"adverse">("pending");
  useEffect(()=>{
    const t = setInterval(async ()=>{
      const r = await fetch("/api/screening/start", { method: "POST"}); // replace with GET status endpoint
      const j = await r.json();
      setStatus(j.status ?? "pending");
      if(["clear","consider","adverse"].includes(j.status)) clearInterval(t);
    }, 2500);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div className="rounded border border-white/10 p-4 text-sm">
      <p>Background screening status: <b>{status}</b></p>
      <p className="opacity-70">You will advance automatically when complete.</p>
    </div>
  );
}
