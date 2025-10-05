"use client";

import { motion } from "framer-motion";
import PageHero from "@/components/PageHero";
import Section from "@/components/Section";
import { ChromeList } from "@/components/ChromeList";
import CTA from "@/components/CTA";

export default function Page() {
  return (
    <main className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHero
          title="About Cabana Management Group"
          subtitle="Luxury creator management and secure booking. Identity-first workflow. Clear contracts. Zero-tolerance policy."
          actions={
            <>
              <CTA href="/intake">Start Booking</CTA>
              <CTA href="/contact">Contact</CTA>
            </>
          }
        />
      </motion.div>
      <Section>
        <h2 className="font-[family-name:var(--font-display)] text-xl mb-3">What we do</h2>
        <ChromeList
          items={[
            {
              title: "Secure Intake",
              desc: "Consent, ID verification, deposit, and background screening before any booking.",
            },
            {
              title: "White-glove Vetting",
              desc: "5-minute live interview to confirm identity and intent. Liveness match required.",
            },
            {
              title: "Contracts & NDA",
              desc: "DocuSign envelopes per engagement. Timestamped and stored securely.",
            },
            {
              title: "Clear Deposits",
              desc: "Escrow-style deposits with transparent refund/forfeit rules.",
            },
          ]}
        />
      </Section>
      <Section>
        <h2 className="font-[family-name:var(--font-display)] text-xl mb-3">Flow</h2>
        <ol className="grid gap-3 md:grid-cols-2 text-sm">
          {[
            "Intake & Consent",
            "ID + Liveness",
            "Deposit",
            "Background Check",
            "Interview",
            "Contracts",
            "Confirmation",
          ].map((s, i) => (
            <li
              key={s}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs">
                {i + 1}
              </span>
              <span className="align-middle">{s}</span>
            </li>
          ))}
        </ol>
      </Section>
    </main>
  );
}
