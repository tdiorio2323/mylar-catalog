import Stepper from "@/components/Stepper";
import DepositForm from "@/components/DepositForm";

export default function Page(){
  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Step 3 · Deposit</h2>
      <Stepper current={2} />
      <DepositForm />
    </main>
  );
}
