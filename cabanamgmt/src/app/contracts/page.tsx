import Stepper from "@/components/Stepper";
import ContractViewer from "@/components/ContractViewer";

export default function Page(){
  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Step 6 · Contracts</h2>
      <Stepper current={5} />
      <ContractViewer />
    </main>
  );
}
