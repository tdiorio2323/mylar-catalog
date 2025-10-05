import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import GlassCard from "@/components/ui/GlassCard";
import { getSession } from "@/lib/getSession";
import { isAdminEmail } from "@/lib/isAdminEmail";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/");
  }

  const { data: codes } = await supabaseAdmin
    .from("vip_codes")
    .select("id, code, role, uses_allowed, uses_remaining, expires_at, created_at")
    .order("created_at", { ascending: false });

  const codesList = codes || [];

  async function mint(formData: FormData) {
    "use server";

    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((entry) => `${entry.name}=${entry.value}`)
      .join("; ");

    const payload = {
      role: String(formData.get("role") || "client"),
      uses_allowed: Number(formData.get("uses_allowed") || 5),
    };

    await fetch(`${BASE_URL}/api/vip/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }).then(async (response) => {
      if (!response.ok) {
        const message = await response.json().catch(() => ({}));
        throw new Error(message.error || "Failed to mint code");
      }

      return response.json();
    });

    revalidatePath("/admin/codes");
  }

  return (
    <main className="space-y-6">
      <GlassCard>
        <h1 className="text-xl font-semibold">VIP Codes</h1>
        <form action={mint} className="mt-4 grid gap-3 md:grid-cols-3">
          <select name="role" className="frosted-input">
            <option value="client">client</option>
            <option value="creator">creator</option>
            <option value="admin">admin</option>
          </select>
          <input
            name="uses_allowed"
            defaultValue="5"
            className="frosted-input"
            min={1}
            type="number"
          />
          <button
            type="submit"
            className="liquid-btn w-full rounded-xl px-5 py-2 text-sm font-semibold text-white"
          >
            Mint
          </button>
        </form>
        <div className="mt-6 space-y-3">
          {codesList.length === 0 ? (
            <p className="text-sm opacity-70">No codes created yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {codesList.map((code) => (
                <li
                  key={code.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-white/90"
                >
                  <span className="font-mono text-base tracking-wide">{code.code}</span>
                  <span className="opacity-80">role: {code.role}</span>
                  <span className="opacity-80">
                    uses {code.uses_remaining}/{code.uses_allowed}
                  </span>
                  <span className="opacity-70">
                    expires {new Date(code.expires_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-4 text-xs opacity-60">List API: GET /api/vip/list</p>
      </GlassCard>
    </main>
  );
}
