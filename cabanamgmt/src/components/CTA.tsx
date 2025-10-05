"use client";

import LiquidButton from "@/components/ui/LiquidButton";
import { useRouter } from "next/navigation";

export default function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  const r = useRouter();
  return <LiquidButton onClick={() => r.push(href)}>{children}</LiquidButton>;
}
