import fs from "node:fs";
import path from "node:path";

const mustPages = [
  "src/app/page.tsx",
  "src/app/intake/page.tsx",
  "src/app/verify/page.tsx",
  "src/app/deposit/page.tsx",
  "src/app/screening/page.tsx",
  "src/app/interview/page.tsx",
  "src/app/contracts/page.tsx",
  "src/app/confirmation/page.tsx",
  "src/app/learn/page.tsx",
  "src/app/vetting/page.tsx",
  "src/app/deposits/page.tsx",
  "src/app/login/page.tsx",
  "src/app/auth/callback/route.ts",
  "src/app/(dash)/dashboard/page.tsx",
];

const mustApi = [
  "src/app/api/identity/start/route.ts",
  "src/app/api/identity/webhook/route.ts",
  "src/app/api/screening/start/route.ts",
  "src/app/api/screening/webhook/route.ts",
  "src/app/api/stripe/create-deposit/route.ts",
  "src/app/api/stripe/webhook/route.ts",
  "src/app/api/contracts/create/route.ts",
  "src/app/api/contracts/webhook/route.ts",
  "src/app/api/interview/schedule/route.ts",
  "src/app/api/users/create/route.ts",
  "src/app/api/db/health/route.ts",
];

const mustComponents = [
  "src/components/Stepper.tsx",
  "src/components/Consent.tsx",
  "src/components/IdCapture.tsx",
  "src/components/DepositForm.tsx",
  "src/components/StatusPanel.tsx",
  "src/components/VideoPick.tsx",
  "src/components/ContractViewer.tsx",
  "src/components/PageHero.tsx",
  "src/components/Section.tsx",
  "src/components/ChromeList.tsx",
  "src/components/ui/GlassCard.tsx",
  "src/components/ui/LiquidButton.tsx",
];

const mustLib = [
  "src/lib/store.ts",
  "src/lib/schema.ts",
  "src/lib/stripe.ts",
  "src/lib/supabase.ts",
  "src/lib/supabaseAdmin.ts",
  "src/lib/db.ts",
  "src/lib/fonts.ts",
  "src/lib/supabaseBrowser.ts",
  "src/lib/supabaseServer.ts",
  "src/lib/getSession.ts",
];

const groups = [
  ["Pages", mustPages],
  ["API", mustApi],
  ["Components", mustComponents],
  ["Lib", mustLib],
];

function exists(p) {
  return fs.existsSync(path.resolve(p));
}

const lines = [];
lines.push("# ROUTE_AUDIT");
lines.push("");
let missingTotal = 0;

for (const [title, list] of groups) {
  lines.push(`## ${title}`);
  lines.push("| Path | Status |");
  lines.push("|------|--------|");
  for (const p of list) {
    const ok = exists(p);
    if (!ok) missingTotal++;
    lines.push(`| \`${p}\` | ${ok ? "✅" : "❌ MISSING"} |`);
  }
  lines.push("");
}

// quick link sanity on landing page
const landing = "src/app/page.tsx";
let linkHints = "";
if (exists(landing)) {
  const src = fs.readFileSync(landing, "utf8");
  const targets = ["/intake", "/learn", "/vetting", "/deposits"];
  const misses = targets.filter((t) => !src.includes(t));
  linkHints = misses.length
    ? `\n**Landing page missing links to:** ${misses.join(", ")}\n`
    : "\nLanding page links to intake/learn/vetting/deposits detected.\n";
}

// write file
lines.push("## Summary");
lines.push(`Missing items: **${missingTotal}**`);
lines.push(linkHints);
fs.writeFileSync("ROUTE_AUDIT.md", lines.join("\n"));

console.log(`Audit complete. Missing: ${missingTotal}. See ROUTE_AUDIT.md.`);
