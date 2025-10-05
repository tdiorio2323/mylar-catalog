import Stepper from "@/components/Stepper";
import StatusPanel from "@/components/StatusPanel";

export default function Page(){
  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Step 4 · Screening</h2>
      <Stepper current={3} />
      <StatusPanel />
      <a href="/interview" className="inline-flex rounded bg-white px-4 py-2 text-black">Continue</a>
    </main>
  );
}
