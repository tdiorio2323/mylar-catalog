import { ReactNode } from "react";

export default function PageHero({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-3xl tracking-tight">
        {title}
      </h1>
      {subtitle ? <p className="mt-2 text-sm opacity-70">{subtitle}</p> : null}
      {actions ? <div className="mt-4 flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
