import { PropsWithChildren } from "react";

export default function Section({ children }: PropsWithChildren) {
  return <section className="glass rounded-2xl p-6 md:p-8">{children}</section>;
}
