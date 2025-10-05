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
          title="Vetting & Screening"
          subtitle="Identity, liveness, background screening, and live interview. Designed to protect all parties."
        />
      </motion.div>
      <Section>
        <h2 className="font-[family-name:var(--font-display)] text-xl mb-3">
          Identity & Liveness
        </h2>
        <ChromeList
          items={[
            {
              title: "Government ID",
              desc: "High-quality capture, front/back. Anti-tamper checks.",
            },
            {
              title: "Face Match & Liveness",
              desc: "Selfie match to ID plus active liveness challenge.",
            },
          ]}
        />
      </Section>
      <Section>
        <h2 className="font-[family-name:var(--font-display)] text-xl mb-3">
          Background Screening
        </h2>
        <ChromeList
          items={[
            {
              title: "Consent-based checks",
              desc: "Consumer-report compliant checks where permitted by law.",
            },
            {
              title: "Decisioning",
              desc: "Statuses: pending, clear, consider/adverse. Adverse action process when required.",
            },
          ]}
        />
      </Section>
      <Section>
        <h2 className="font-[family-name:var(--font-display)] text-xl mb-3">Live Interview</h2>
        <p className="text-sm opacity-80">
          Mandatory 5-minute video call to confirm identity and intent before contracts or
          scheduling.
        </p>
      </Section>
    </main>
  );
}
