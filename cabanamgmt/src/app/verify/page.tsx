import Stepper from "@/components/Stepper";
import IdCapture from "@/components/IdCapture";

export default function Page(){
  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Step 2 · Identity Verification</h2>
      <Stepper current={1} />
      <IdCapture />
      <p className="text-xs opacity-70">We match your selfie with your ID and may run liveness checks. Data retained only as required for safety and compliance.</p>
    </main>
  );
}
