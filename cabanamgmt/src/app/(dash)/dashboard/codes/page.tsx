"use client";
import { useEffect, useState, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { toast } from "sonner";

type VipCode = {
  code: string;
  role: string;
  uses_allowed: number;
  uses_remaining: number;
  expires_at: string;
};

export default function CodesPage() {
  const supabase = supabaseBrowser();
  const [codes, setCodes] = useState<VipCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: "", role: "creator", uses: 25, days: 30 });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("vip_codes")
      .select("code, role, uses_allowed, uses_remaining, expires_at")
      .order("created_at", { ascending: false });
    setCodes(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const mint = async () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + form.days);

    const { error } = await supabase.rpc("mint_vip_code", {
      p_code: form.code || null,
      p_role: form.role,
      p_uses: form.uses,
      p_expires_at: expiresAt.toISOString(),
      p_metadata: {}
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("VIP code created!");
      setForm({ ...form, code: "" });
      load();
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-2xl bg-black/50 border border-white/10 p-5">
        <div className="font-medium mb-3">Mint Code</div>
        <div className="grid sm:grid-cols-5 gap-3">
          <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                 placeholder="Custom code (optional)" value={form.code}
                 onChange={e=>setForm(f=>({...f, code:e.target.value.toUpperCase()}))}/>
          <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                  value={form.role} onChange={e=>setForm(f=>({...f, role:e.target.value}))}>
            <option value="creator">creator</option><option value="client">client</option><option value="admin">admin</option>
          </select>
          <input type="number" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                 placeholder="Uses" value={form.uses} onChange={e=>setForm(f=>({...f, uses:+e.target.value}))}/>
          <input type="number" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                 placeholder="Valid days" value={form.days} onChange={e=>setForm(f=>({...f, days:+e.target.value}))}/>
          <button onClick={mint} className="rounded-xl bg-white/90 text-black px-4 py-2 hover:bg-white font-semibold">Create</button>
        </div>
      </div>

      <div className="rounded-2xl bg-black/50 border border-white/10">
        <div className="px-5 py-4 border-b border-white/10 font-medium">Codes</div>
        <div className="divide-y divide-white/10">
          {loading ? <div className="px-5 py-6 text-sm opacity-70">Loading…</div> :
            codes.map((c)=>(
              <div key={c.code} className="px-5 py-3 grid sm:grid-cols-5 gap-2 text-sm">
                <div className="font-mono">{c.code}</div>
                <div>{c.role}</div>
                <div>Allowed: {c.uses_allowed}</div>
                <div>Remaining: {c.uses_remaining}</div>
                <div className="opacity-60">{new Date(c.expires_at).toLocaleDateString()}</div>
              </div>
            ))}
          {!loading && !codes.length && (
            <div className="px-5 py-6 text-sm opacity-70">No codes yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
