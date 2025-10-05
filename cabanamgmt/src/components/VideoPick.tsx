"use client";
export default function VideoPick(){
  return (
    <div className="space-y-3">
      <p className="text-sm">Pick a 5-minute interview slot. Video is required for final approval.</p>
      <iframe className="h-[520px] w-full rounded bg-white/5" src="https://calendly.com/your-handle/5min?hide_event_type_details=1&hide_gdpr_banner=1"></iframe>
      <a href="/contracts" className="inline-flex rounded bg-white px-4 py-2 text-black">Continue</a>
    </div>
  );
}
