export default function Stepper({ current }: { current: number }) {
  const steps = ["Intake", "Verify", "Deposit", "Screening", "Interview", "Contracts", "Confirm"];
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((s, i) => (
        <li key={s} className={`rounded-full px-3 py-1 text-xs ${i<=current?"bg-white text-black":"bg-white/10"}`}>{i+1}. {s}</li>
      ))}
    </ol>
  );
}
