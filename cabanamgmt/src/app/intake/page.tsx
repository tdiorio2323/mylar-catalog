import Stepper from "@/components/Stepper";
import Consent from "@/components/Consent";

export default function Page(){
  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Step 1 · Intake & Consent</h2>
      <Stepper current={0} />
      <Consent />
    </main>
  );
}
