import Stepper from "@/components/Stepper";
import VideoPick from "@/components/VideoPick";

export default function Page(){
  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Step 5 · Video Interview</h2>
      <Stepper current={4} />
      <VideoPick />
    </main>
  );
}
