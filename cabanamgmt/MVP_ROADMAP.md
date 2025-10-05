# 🚀 Cabana Management Platform - MVP Roadmap

## Phase 1: Core Testing & Validation (This Week)

### 🔴 Critical Path - Must Complete First

- [ ] **Enable Email auth provider in Supabase Dashboard**
  - Location: https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/auth/providers
  - Action: Toggle "Email" to ON
  - Time: 30 seconds

- [ ] **Sign in to app at localhost:3000**
  - Email: tyler@tdstudiosny.com
  - Password: (set in Supabase)
  - Verify: Homepage loads, auth works

- [ ] **Test admin access at /admin/codes**
  - Should see VIP code management interface
  - Verify: tyler@tdstudiosny.com recognized as admin

- [ ] **Create second test user (non-admin)**
  - Dashboard → Auth → Users → Add user
  - Email: client@example.com
  - Auto-confirm email

- [ ] **Test VIP code minting**
  - As admin: Create new code at /admin/codes
  - Verify: Code appears in list, has correct permissions

- [ ] **Test VIP code redemption**
  - Sign out, sign in as client@example.com
  - Redeem code: CABANA-ALPHA-0001
  - Verify: Redemption succeeds, can't redeem twice

---

## Phase 2: Payment Integration (Week 2)

### 💳 Stripe Setup

- [ ] **Get real Stripe API keys**
  - Dashboard: https://dashboard.stripe.com/apikeys
  - Replace in .env.local:
    - `STRIPE_SECRET_KEY`
    - `STRIPE_WEBHOOK_SECRET` (after webhook setup)
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- [ ] **Configure Stripe webhook**
  - URL: https://your-domain.com/api/stripe/webhook
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
  - Get signing secret, add to .env.local

- [ ] **Test deposit flow**
  - Visit: /deposit page
  - Create test PaymentIntent
  - Use Stripe test card: 4242 4242 4242 4242
  - Verify: Payment succeeds, deposit recorded in DB

- [ ] **Implement refund logic**
  - Refund deposit if screening fails
  - Track status in `bookings.deposit_status`

---

## Phase 3: Identity Verification (Week 3)

### 🆔 Choose: Onfido OR Veriff

**Onfido Setup:**
- [ ] Sign up: https://onfido.com
- [ ] Get API token, add to `.env.local`
- [ ] Install SDK: `npm install @onfido/api`
- [ ] Implement `/api/identity/start` (create applicant + check)
- [ ] Implement `/api/identity/webhook` (process results)
- [ ] Update `/verify` page to use real SDK

**OR Veriff Setup:**
- [ ] Sign up: https://veriff.com
- [ ] Get API credentials
- [ ] Implement via REST API (no official npm package)
- [ ] Similar webhook + status tracking

**Testing:**
- [ ] Upload test ID documents
- [ ] Verify selfie liveness check works
- [ ] Confirm verification status updates in DB

---

## Phase 4: Background Screening (Week 4)

### 🔍 Choose: Checkr OR Certn

**Checkr Setup:**
- [ ] Sign up: https://checkr.com
- [ ] Get API key, add to `.env.local`
- [ ] Implement `/api/screening/start`
- [ ] Implement `/api/screening/webhook`
- [ ] Handle FCRA compliance (adverse action notices)

**Testing:**
- [ ] Run test background check
- [ ] Verify webhook updates screening status
- [ ] Test adverse action flow

---

## Phase 5: Contracts & Scheduling (Week 5)

### 📄 DocuSign Integration

- [ ] Sign up: https://developers.docusign.com
- [ ] Create integration key
- [ ] Generate RSA keypair for JWT auth
- [ ] Install SDK: `npm install docusign-esign`
- [ ] Implement `/api/contracts/create` (generate envelope)
- [ ] Implement `/api/contracts/webhook` (track signing)
- [ ] Create NDA + booking agreement templates

### 📅 Calendly Integration

- [ ] Sign up: https://calendly.com
- [ ] Get API key or use iframe embed
- [ ] Implement `/api/interview/schedule`
- [ ] Update `/interview` page with booking widget
- [ ] Track scheduled interviews in DB

---

## Phase 6: Email Notifications (Week 6)

### 📧 Choose: Postmark OR Resend

**Postmark (recommended for compliance):**
- [ ] Sign up: https://postmarkapp.com
- [ ] Get API key
- [ ] Install: `npm install postmark`
- [ ] Create email templates (confirmation, adverse action, etc.)
- [ ] Implement notification triggers

**Email Types Needed:**
- [ ] Booking confirmation
- [ ] Verification status updates
- [ ] Screening results (FCRA-compliant)
- [ ] Interview reminders
- [ ] Contract signing reminders

---

## Phase 7: Compliance & Safety (Week 7)

### 🛡️ Content Moderation

- [ ] Choose service: OpenAI Moderation API or AWS Comprehend
- [ ] Add moderation check in booking intake
- [ ] Flag/reject requests containing sexual content
- [ ] Log violations for review

### 🗑️ PII Retention

- [ ] Implement CRON job (Vercel Cron or Supabase Functions)
- [ ] Auto-purge PII after 30-90 days
- [ ] Keep anonymized booking data for analytics
- [ ] Document retention policy

### 📋 Legal

- [ ] Draft Terms of Service
- [ ] Draft Privacy Policy
- [ ] Create FCRA disclosure forms
- [ ] Get legal review (recommended)

---

## Phase 8: Production Deployment (Week 8)

### 🌐 Build & Deploy

- [ ] **Fix Google Fonts issue**
  - Option A: Download fonts to `public/fonts/`
  - Option B: Build on networked CI/CD (GitHub Actions, Vercel)

- [ ] **Run production build**
  ```bash
  npm run build
  npm run start  # Test locally
  ```

- [ ] **Deploy to Vercel**
  - Connect GitHub repo
  - Configure environment variables
  - Enable automatic deployments

### 🔐 Security Hardening

- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure CSP headers
- [ ] Set up rate limiting (Vercel Edge Config or Upstash)
- [ ] Review RLS policies in Supabase
- [ ] Rotate all API keys to production values

### 📊 Monitoring

- [ ] Set up Sentry for error tracking
- [ ] Configure Vercel Analytics
- [ ] Set up uptime monitoring (UptimeRobot, Better Uptime)
- [ ] Create admin dashboard for metrics

### 🌍 DNS & Domain

- [ ] Purchase domain (e.g., cabanamgmt.com)
- [ ] Configure DNS records
- [ ] Add domain to Vercel project
- [ ] Set up SSL certificate (automatic on Vercel)

---

## Quick Wins (Can Do Anytime)

- [ ] Add loading states to all forms
- [ ] Improve error messages with user-friendly text
- [ ] Add toast notifications (already using Sonner)
- [ ] Create 404 and error pages
- [ ] Add SEO metadata (Open Graph, Twitter Cards)
- [ ] Test mobile responsiveness
- [ ] Add accessibility improvements (ARIA labels, keyboard nav)
- [ ] Create user onboarding flow
- [ ] Add analytics tracking (GA4, Posthog)

---

## Success Metrics for MVP

### User Flow Completion Rate
- [ ] 80%+ of users complete intake → deposit
- [ ] 90%+ pass ID verification
- [ ] 70%+ pass background screening
- [ ] 95%+ sign contracts

### Performance
- [ ] Page load < 3s (LCP)
- [ ] API response time < 500ms (p95)
- [ ] Zero critical security vulnerabilities

### Business
- [ ] Process 10 successful bookings
- [ ] Zero data breaches or PII leaks
- [ ] FCRA compliance audit passes
- [ ] Legal review completed

---

## Estimated Timeline

**Fastest Path to MVP: 8 weeks**

| Phase | Duration | Blockers |
|-------|----------|----------|
| Core Testing | 1 week | None (can start now) |
| Stripe | 1 week | Need API keys |
| Identity | 1 week | Vendor approval (Onfido/Veriff) |
| Screening | 1 week | Vendor approval (Checkr) |
| Contracts | 1 week | DocuSign setup |
| Email | 3 days | None |
| Compliance | 1 week | Legal review |
| Production | 1 week | Build issues resolved |

**Total: ~8 weeks to production-ready MVP**

---

## Risk Mitigation

### High Risk
1. **Vendor approvals** (Checkr, Onfido) can take 1-2 weeks
   - Mitigation: Apply early, have backups (Certn, Veriff)

2. **FCRA compliance** errors can result in lawsuits
   - Mitigation: Legal review mandatory, use Checkr's compliance tools

3. **PII data breach** would be catastrophic
   - Mitigation: RLS policies, encryption at rest, regular audits

### Medium Risk
1. **Google Fonts build issue** blocks production
   - Mitigation: Host fonts locally (documented in CLAUDE.md)

2. **Stripe webhook failures** could lose payment data
   - Mitigation: Implement retry logic, manual reconciliation process

---

## Next Immediate Action

**👉 Start with Phase 1, Task 1:**

Open: https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/auth/providers

Toggle "Email" to ON. Then test sign-in at http://localhost:3000.

That's it! You're on your way to MVP. 🚀
