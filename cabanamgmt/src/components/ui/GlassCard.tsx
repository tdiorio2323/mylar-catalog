import { PropsWithChildren } from "react";

export default function GlassCard({ children }: PropsWithChildren) {
  return <div className="glass rounded-2xl p-5 shadow-glow">{children}</div>;
}
