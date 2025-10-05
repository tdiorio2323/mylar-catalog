"use client";
export default function ContractViewer(){
  const create = async ()=>{
    await fetch("/api/contracts/create", { method: "POST" });
    location.href = "/confirmation";
  };
  return (
    <div className="space-y-3 text-sm">
      <p>NDA + Booking Terms will open via e-sign provider. Sign to proceed.</p>
      <button onClick={create} className="rounded bg-white px-4 py-2 text-black">Open NDA & Terms</button>
    </div>
  );
}
