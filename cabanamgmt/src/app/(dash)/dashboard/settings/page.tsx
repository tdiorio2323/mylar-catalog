"use client";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      router.push("/");
    }
  };

  return (
    <div className="rounded-2xl bg-black/50 border border-white/10 p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>

      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-medium opacity-70 mb-3">Account</h3>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200"
          >
            Sign Out
          </button>
        </section>

        <section>
          <h3 className="text-sm font-medium opacity-70 mb-3">More Settings</h3>
          <p className="text-sm opacity-70">Coming soon…</p>
        </section>
      </div>
    </div>
  );
}
