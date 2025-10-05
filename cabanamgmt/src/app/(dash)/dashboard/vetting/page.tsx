import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function VettingPage() {
  const supabase = await supabaseServer();
  const { data: rows, error } = await supabase
    .from("vip_redemptions")
    .select(`
      id,
      user_id,
      code_id,
      ip,
      user_agent,
      created_at,
      vip_codes (code, role)
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="rounded-2xl bg-black/50 border border-white/10 text-white">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="font-medium">VIP Redemptions & Vetting</div>
        {error && <span className="text-red-300 text-sm">{error.message}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="[&>th]:px-4 [&>th]:py-3 text-left opacity-80">
              <th>Redeemed</th>
              <th>Code</th>
              <th>Role</th>
              <th>User ID</th>
              <th>IP</th>
              <th>User Agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {(rows ?? []).map((r) => {
              const vipCode = r.vip_codes as { code?: string; role?: string } | null;
              return (
                <tr key={r.id} className="[&>td]:px-4 [&>td]:py-3">
                  <td className="opacity-70">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="font-mono">{vipCode?.code || "-"}</td>
                  <td className="opacity-80">{vipCode?.role || "-"}</td>
                  <td className="font-mono opacity-60 text-xs">{r.user_id}</td>
                  <td className="opacity-70">{r.ip || "-"}</td>
                  <td className="opacity-60 text-xs max-w-xs truncate">{r.user_agent || "-"}</td>
                </tr>
              );
            })}
            {!rows?.length && (
              <tr><td className="px-4 py-6 opacity-70" colSpan={6}>No redemptions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
