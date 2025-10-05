"use client";

import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import { ChromeList } from "@/components/ChromeList";

export default function Page() {
  return (
    <main className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHero
          title="Deposits & Payments"
          subtitle="Simple, transparent rules. Deposits reserve time and deter no-shows."
        />
      </motion.div>
      <Section>
        <h2 className="font-[family-name:var(--font-display)] text-xl mb-3">Policy</h2>
        <ChromeList
          items={[
            {
              title: "Reservation",
              desc: "Deposit required to hold a slot. Applied to final balance where applicable.",
            },
            {
              title: "Refunds",
              desc: "Refunded if screening fails or Cabana cancels. Non-refundable for no-shows or policy breaches.",
            },
            {
              title: "Charge Handling",
              desc: "Processed via secure payment provider. Disputes follow provider rules.",
            },
          ]}
        />
      </Section>
      <Section>
        <h2 className="font-[family-name:var(--font-display)] text-xl mb-3">Security</h2>
        <ChromeList
          items={[
            {
              title: "PCI-aligned processing",
              desc: "No raw card data touches Cabana's servers.",
            },
            {
              title: "Audit trail",
              desc: "Timestamps and metadata recorded for each transaction.",
            },
          ]}
        />
      </Section>
    </main>
  );
}
