export function ChromeList({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li
          key={it.title}
          className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
        >
          <div className="font-medium">{it.title}</div>
          <p className="text-sm opacity-70">{it.desc}</p>
        </li>
      ))}
    </ul>
  );
}
