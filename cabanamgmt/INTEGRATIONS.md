# INTEGRATIONS.md

## Overview
This document defines all vendor integrations for Cabana Management Group booking platform. Each section lists:
- Purpose in booking flow
- NPM package(s) to install
- Required environment variables
- API route mappings in `src/app/api/...`
- Notes on compliance / webhooks

---

## 1. Stripe – Deposits & Payments

**Purpose:** Secure non-refundable deposits, booking confirmations.

**Install:**
```bash
npm install stripe @stripe/stripe-js
```

**Env Vars:**
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

**Routes:**
- `POST /api/stripe/create-deposit` → Create PaymentIntent
- `POST /api/stripe/webhook` → Verify + capture deposit events

**Notes:**
- Always validate webhook signatures with `STRIPE_WEBHOOK_SECRET`
- Store `payment_intent_id` in Supabase `bookings` table

---

## 2. Onfido / Veriff – ID + Liveness

**Purpose:** Verify ID documents, selfie, liveness.

**Install:**
```bash
npm install @onfido/api
# Veriff: REST API via fetch or axios
```

**Env Vars:**
```env
ONFIDO_API_TOKEN=onfido_live_xxx
VERIFF_API_TOKEN=veriff_live_xxx
```

**Routes:**
- `POST /api/identity/start` → Create applicant/check
- `POST /api/identity/webhook` → Handle completed verifications

**Notes:**
- Liveness check + doc upload required before booking proceeds
- Store verification result in `users.verification_status`

---

## 3. Checkr (or Certn) – Background Screening

**Purpose:** Run U.S. background checks, criminal record, sex offender registry.

**Install:** No official package, call REST API.

**Env Vars:**
```env
CHECKR_API_KEY=checkr_live_xxx
CERTN_API_KEY=certn_live_xxx
```

**Routes:**
- `POST /api/screening/start` → Create candidate + report
- `POST /api/screening/webhook` → Handle Checkr/CERTN callbacks

**Notes:**
- Must handle FCRA compliance (pre-adverse/adverse action letters)
- Store result in `users.screening_status`

---

## 4. DocuSign – NDAs & Contracts

**Purpose:** Deliver NDA and booking agreement before confirmation.

**Install:**
```bash
npm install docusign-esign
```

**Env Vars:**
```env
DOCUSIGN_INTEGRATOR_KEY=xxx
DOCUSIGN_USER_ID=xxx
DOCUSIGN_ACCOUNT_ID=xxx
DOCUSIGN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----…"
```

**Routes:**
- `POST /api/contracts/create` → Generate envelope & signing link
- `POST /api/contracts/webhook` → Update NDA status

**Notes:**
- Use embedded signing flow for seamless UX
- Store NDA signed status in `bookings.nda_signed`

---

## 5. Supabase – Database & Storage

**Purpose:** Store users, bookings, statuses, file uploads.

**Install:**
```bash
npm install @supabase/supabase-js
```

**Env Vars:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Schema (core):**
```sql
users(id uuid, full_name text, email text, phone text,
     verification_status text, screening_status text,
     created_at timestamptz);

bookings(id uuid, user_id uuid, deposit_status text,
         interview_status text, nda_signed bool,
         slot timestamptz, created_at timestamptz);
```

**Routes:** Supabase client used across all API routes for persistence.

---

## 6. Email Notifications

**Purpose:** Send booking confirmations, screening notices.

**Options:**
- Postmark → transactional reliability
- Resend → simpler dev experience

**Install:**
```bash
npm install postmark resend
```

**Env Vars:**
```env
POSTMARK_API_KEY=xxx
RESEND_API_KEY=xxx
```

**Routes:**
- Hook into `/api/confirmation` to send booking confirmation email
- Hook into `/api/screening/webhook` for compliance notices

---

## Flow → Vendor Mapping

| Step | Vendor(s) | Route(s) |
|------|-----------|----------|
| Intake | Supabase | users insert |
| Verify | Onfido / Veriff | `/api/identity/start` |
| Deposit | Stripe | `/api/stripe/create-deposit` |
| Screening | Checkr / Certn | `/api/screening/start` |
| Interview | Supabase (scheduling) | `/api/interview/schedule` |
| Contracts | DocuSign | `/api/contracts/create` |
| Confirm | Postmark / Resend | email trigger |

---

## Execution Order

1. ✅ Stripe → deposits functional first
2. ✅ Onfido/Veriff → ID verification & selfie match
3. ✅ Checkr → background checks
4. ✅ DocuSign → NDAs/contracts
5. ✅ Supabase → central database + API layer
6. ✅ Email → notifications + compliance letters
