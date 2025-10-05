import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function OverviewPage() {
  const [
    { count: codesCount },
    { count: redemptionsCount },
  ] = await Promise.all([
    supabaseAdmin.from("vip_codes").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("vip_redemptions").select("*", { count: "exact", head: true }),
  ]);

  const { data: recentCodes } = await supabaseAdmin
    .from("vip_codes")
    .select("code, role, uses_remaining, expires_at")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Kpi title="VIP Codes" value={codesCount ?? 0}/>
        <Kpi title="Redemptions" value={redemptionsCount ?? 0}/>
        <Kpi title="Active Bookings" value={0}/>
      </section>

      <section className="rounded-2xl bg-black/50 border border-white/10 text-white">
        <div className="px-6 py-4 border-b border-white/10 font-medium">Recent VIP Codes</div>
        <div className="divide-y divide-white/10">
          {(recentCodes ?? []).map((c) => (
            <div key={c.code} className="px-6 py-3 flex items-center justify-between text-sm">
              <div className="font-mono">{c.code}</div>
              <div className="opacity-80">{c.role}</div>
              <div className="opacity-80">Left: {c.uses_remaining}</div>
              <div className="opacity-60">{new Date(c.expires_at!).toLocaleDateString()}</div>
            </div>
          ))}
          {!recentCodes?.length && (
            <div className="px-6 py-6 text-sm opacity-70">No codes yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-black/50 border border-white/10 text-white p-5">
      <div className="text-sm opacity-70">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}
