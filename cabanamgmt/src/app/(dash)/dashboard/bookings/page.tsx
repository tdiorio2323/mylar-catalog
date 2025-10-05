import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const supabase = await supabaseServer();
  const { data: rows, error } = await supabase
    .from("bookings")
    .select("id, user_id, slot, deposit_status, interview_status, nda_signed, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="rounded-2xl bg-black/50 border border-white/10 text-white">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="font-medium">Bookings</div>
        {error && <span className="text-red-300 text-sm">{error.message}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="[&>th]:px-4 [&>th]:py-3 text-left opacity-80">
              <th>Created</th><th>User</th><th>Slot</th>
              <th>Deposit</th><th>Interview</th><th>NDA</th><th>ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {(rows ?? []).map((b) => (
              <tr key={b.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="opacity-70">{new Date(b.created_at).toLocaleString()}</td>
                <td className="font-mono opacity-80">{b.user_id}</td>
                <td className="opacity-80">{b.slot ? new Date(b.slot).toLocaleString() : "-"}</td>
                <td>{b.deposit_status}</td>
                <td>{b.interview_status}</td>
                <td>{b.nda_signed ? "Yes" : "No"}</td>
                <td className="font-mono opacity-60">{b.id}</td>
              </tr>
            ))}
            {!rows?.length && (
              <tr><td className="px-4 py-6 opacity-70" colSpan={7}>No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
