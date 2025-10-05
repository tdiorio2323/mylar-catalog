import Link from "next/link";
import Stepper from "@/components/Stepper";

export default function Page(){
  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Step 7 · Confirmed</h2>
      <Stepper current={6} />
      <div className="rounded border border-white/10 p-4 text-sm">
        <p>You&apos;re confirmed. You&apos;ll receive email with meeting link and final details.</p>
      </div>
      <Link className="inline-flex rounded bg-white px-4 py-2 text-black" href="/">Back to start</Link>
    </main>
  );
}
