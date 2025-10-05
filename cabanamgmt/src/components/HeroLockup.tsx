import Image from "next/image";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import LiquidButton from "@/components/ui/LiquidButton";

export default function HeroLockup() {
  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex items-center gap-4">
          <Image
            src="/cabana-logo.png"
            alt="Cabana"
            width={72}
            height={72}
            className="animate-in fade-in rounded-lg"
          />
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
              Cabana Management Group
            </h1>
            <p className="text-sm opacity-70">Secure, verified, luxury bookings</p>
          </div>
        </div>
      </GlassCard>
      <div className="flex gap-3">
        <Link href="/intake">
          <LiquidButton>Start Booking</LiquidButton>
        </Link>
        <LiquidButton className="bg-white/5">Learn More</LiquidButton>
      </div>
    </div>
  );
}
