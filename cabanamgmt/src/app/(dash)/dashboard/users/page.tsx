import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // Use admin client to query auth.users
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  const rows = users?.users || [];

  return (
    <div className="rounded-2xl bg-black/50 border border-white/10 text-white">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="font-medium">Users ({rows.length})</div>
        {error && <span className="text-red-300 text-sm">{error.message}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="[&>th]:px-4 [&>th]:py-3 text-left opacity-80">
              <th>Email</th>
              <th>Created</th>
              <th>Last Sign In</th>
              <th>Confirmed</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((u) => (
              <tr key={u.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="font-medium">{u.email}</td>
                <td className="opacity-70">{new Date(u.created_at).toLocaleString()}</td>
                <td className="opacity-70">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}</td>
                <td>{u.confirmed_at ? "✓" : "Pending"}</td>
                <td className="font-mono opacity-60 text-xs">{u.id}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="px-4 py-6 opacity-70" colSpan={5}>No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
