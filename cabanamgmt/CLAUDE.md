# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Creator booking platform MVP for Cabana Management Group (locust_growth_accelerator). Platform handles promotional appearances and companionship services with comprehensive security-first workflow including identity verification, deposit processing, background screening, video interviews, and contract e-signing.

**Tech Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui + Stripe + Supabase + Framer Motion

**Additional Documentation**:
- `INTEGRATIONS.md` - Detailed vendor integration specifications (Stripe, Onfido/Veriff, Checkr/Certn, DocuSign, email providers)
- `AGENTS.md` - Repository guidelines including module organization, coding style, testing guidelines, and PR conventions

## Development Commands

### Core Commands
```bash
npm install           # Install dependencies (uses npm, not pnpm)
npm run dev           # Start Turbopack dev server at localhost:3000
npm run build         # Build production bundle (required before release)
npm run start         # Serve production build locally
npm run lint          # Run ESLint (must pass before PR)
npm run typecheck     # Run TypeScript type checking without emitting files
npm run audit         # Run project audit script (scripts/project-audit.mjs)
node scripts/check-routes.mjs  # Audit route completeness
```

### Build Troubleshooting
```bash
# If build fails with Google Fonts network errors:
NEXT_TURBOPACK=0 npm run build  # Disable Turbopack (Next.js 15 may ignore this)

# Known issue: Next.js 15 may attempt Turbopack CSS processing even with NEXT_TURBOPACK=0
# Workaround: Run builds on networked machine with access to fonts.googleapis.com
# Alternative: Host fonts locally in public/ and update src/lib/fonts.ts
```

### Database Migrations

**Required migrations before first run:**
```bash
# 1. Login to Supabase CLI (one-time setup)
supabase login

# 2. Link to your Supabase project
supabase link --project-ref dotfloiygvhsujlwzqgv

# 3. Push all migrations
supabase db push

# 4. Set admin emails in database
# Replace with your comma-separated admin email list
supabase db query "alter database postgres set app.admin_emails = 'tyler@tdstudiosny.com';"
```

**Manual migration via Supabase Dashboard:**
If CLI is unavailable, execute SQL files in Dashboard → SQL Editor:
1. `supabase/migrations/0001_init.sql` - Core users/bookings tables
2. `supabase/migrations/0003_vip.sql` - VIP codes + RLS policies
3. `supabase/migrations/0004_vip_helpers.sql` - Helper functions (decrement_uses RPC)
4. Run: `alter database postgres set app.admin_emails = 'your@email.com';`

**All schema changes must be tracked in migration files.**

## Architecture

### Three-Track Application Structure

The application has evolved into three parallel tracks:

1. **Public Pages** (`/`, `/learn`, `/vetting`, `/deposits`) - Marketing/educational content with luxury UI components (GlassCard, HeroLockup, PageHero, ChromeList, CTA)

2. **Booking Flow** (7-step wizard: `/intake` → `/verify` → `/deposit` → `/screening` → `/interview` → `/contracts` → `/confirmation`) - User booking journey with Zustand state management (`src/lib/store.ts`) and Zod validation (`src/lib/schema.ts`)

3. **Admin Portal** (`/login`, `/dashboard/*`, `/admin/codes`) - Supabase Auth-protected admin access with VIP code management and invitation system. Uses route group `(dash)/dashboard` for shared layout. Subpages include bookings, users, deposits, codes, vetting, invite, and settings. Admin emails controlled via `ADMIN_EMAILS` env var and `src/lib/isAdminEmail.ts`

### State Management

- **Zustand store** (`src/lib/store.ts`): Global booking state tracking across 7-step wizard with statuses for consent, IDV, deposit, screening, interview, contracts
- **Zod schemas** (`src/lib/schema.ts`): Form validation for `consentSchema`, `idvSchema`, `depositSchema`

### Database Schema

Core tables in `supabase/migrations/0001_init.sql`:
- `users` - User profiles with verification_status, screening_status
- `bookings` - Booking records linked to users with deposit_status, interview_status, nda_signed

VIP system in `supabase/migrations/0003_vip.sql`:
- `vip_codes` - Admin-generated invite codes with role, usage limits, expiration
- `vip_redemptions` - Code redemption tracking with user_id, IP, user_agent
- RLS policies enforcing admin-only access via `is_admin()` function

Invitation system (newer migrations):
- Additional invitation/invite tables for enhanced invitation tracking
- See `supabase/migrations/0005_invites.sql` and `0006_invitations.sql` for schema details

### Supabase Client Files

Multiple Supabase client patterns for different contexts:
- `src/lib/supabase.ts` - Legacy browser client (basic)
- `src/lib/supabaseBrowser.ts` - SSR-compatible browser client
- `src/lib/supabaseServer.ts` - Server-side client for route handlers
- `src/lib/supabaseAdmin.ts` - Service role client for admin operations
- `src/lib/getSession.ts` - Centralized session retrieval

### API Routes

**Production Routes:**
- `/api/db/health` - Database health check
- `/api/users/create` - User account creation
- `/api/vip/create` - Generate VIP codes (admin-protected)
- `/api/vip/list` - List all VIP codes (admin-protected)
- `/api/vip/redeem` - Redeem VIP code
- `/api/invites/create` - Create invitation (admin-protected)
- `/api/invites/list` - List invitations (admin-protected)
- `/api/invites/accept` - Accept invitation
- `/api/invites/revoke` - Revoke invitation (admin-protected)
- `/api/stripe/create-deposit` - Create Stripe PaymentIntent

**Stubbed Routes (need vendor SDK integration):**
- `/api/identity/start` + `/api/identity/webhook` - Onfido/Veriff IDV
- `/api/screening/start` + `/api/screening/webhook` - Checkr/Certn background checks
- `/api/stripe/webhook` - Stripe event processing
- `/api/contracts/create` + `/api/contracts/webhook` - DocuSign envelope handling
- `/api/interview/schedule` - Calendly/Google Calendar booking

### Key Components

**Booking Flow:**
- `Stepper.tsx` - 7-step progress indicator (Intake, Verify, Deposit, Screening, Interview, Contracts, Confirm)
- `Consent.tsx` - React Hook Form + Zod validation for consent
- `IdCapture.tsx` - File upload for ID + selfie
- `DepositForm.tsx` - Stripe payment integration
- `StatusPanel.tsx` - Polling-based status checker (replace with webhooks)
- `VideoPick.tsx` - Calendly iframe embed
- `ContractViewer.tsx` - DocuSign redirect handler

**UI Library:**
- `GlassCard.tsx` - Glassmorphic card component
- `HeroLockup.tsx`, `PageHero.tsx` - Hero section patterns
- `ChromeList.tsx` - Feature list component
- `CTA.tsx` - Call-to-action sections
- `LiquidButton.tsx` - Animated button with liquid effect
- `AnimatedWrapper.tsx` - Framer Motion animation wrapper
- `HomeHeroAuth.tsx` - Authenticated homepage hero

### Custom Fonts

`src/lib/fonts.ts` defines four font families:
- `sans` - Primary sans-serif
- `display` - Display/heading font
- `inter` - Inter font
- `script` - Script/decorative font

Applied via CSS variables in `src/app/layout.tsx`

### Styling Architecture

- Tailwind 4 with custom marble background (`lovable-uploads/td-studios-black-marble.png`)
- Custom theme colors defined in `tailwind.config.ts` (bg, ink, etc.)
- Global styles in `src/app/globals.css`
- Centered max-width layout (5xl) in root layout
- Fixed background attachment for parallax effect

## Environment Configuration

### Required Setup

1. Copy `.env.local.example` to `.env.local`
2. Populate Supabase credentials from your project dashboard
3. Set `ADMIN_EMAILS` to comma-separated list of admin email addresses
4. Add vendor API keys as integrations are implemented

**Critical variables for basic functionality:**
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase - Required for auth, database, VIP codes
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Admin Access - Required for /admin/codes and admin-protected routes
ADMIN_EMAILS=tyler@tdstudiosny.com,admin@example.com

# Stripe - Required for deposit flow
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Optional vendor integrations (stub routes exist):**
```env
# Identity Verification (Onfido/Veriff)
ONFIDO_API_TOKEN=
VERIFF_API_TOKEN=

# Background Screening (Checkr/Certn)
CHECKR_API_KEY=
CERTN_API_KEY=

# DocuSign (Contracts)
DOCUSIGN_INTEGRATOR_KEY=
DOCUSIGN_USER_ID=
DOCUSIGN_ACCOUNT_ID=
DOCUSIGN_PRIVATE_KEY=

# Email Notifications (Postmark/Resend)
POSTMARK_API_KEY=
RESEND_API_KEY=
```

## Important Implementation Notes

1. **Webhook Security**: All webhooks (Stripe, IDV, screening) require signature verification before processing
2. **Admin Access**: Controlled by `ADMIN_EMAILS` env var (comma-separated) + `is_admin()` Postgres function in `supabase/migrations/0003_vip.sql`. Admin emails must match exactly between env var and database setting.
3. **VIP Code System**: Admin-generated invite codes with role-based access, usage tracking, and expiration. Uses deterministic code generation via `src/lib/crypto.ts` and RPC function `decrement_uses` in `0004_vip_helpers.sql`.
4. **Status Polling**: `StatusPanel.tsx` uses polling - replace with server-sent events or webhooks for production
5. **Policy Enforcement**: Zero-tolerance for sexual service requests - implement content moderation before launch
6. **Data Retention**: PII must be purged per compliance (30-90 days) - implement CRON jobs
7. **FCRA Compliance**: Adverse action notices required when denying based on background checks
8. **Deposit Logic**: Refund if screening fails, forfeit on no-show/policy violation, track state via Stripe metadata
9. **Google Fonts**: Build requires network access to fonts.googleapis.com for Manrope, Cinzel, Ballet, Inter. For offline builds, download fonts to `public/fonts/` and update `src/lib/fonts.ts` to use `src: url('/fonts/...')` instead of `next/font/google`.
10. **Background Image**: Marble texture at `public/lovable-uploads/td-studios-black-marble.png` must exist and have no spaces in filename for layout background to load correctly.

## Coding Standards

- TypeScript with 2-space indentation, trailing commas in multiline literals
- React components, hooks, Zustand stores use PascalCase filenames (`Stepper.tsx`, `useBookingStore.ts`)
- Route handlers use lowercase hyphenated filenames matching URLs
- Prefer Tailwind utility classes; introduce scoped CSS only when composition demands it
- Colocate styles near components

## Testing & QA

No automated tests yet - document manual QA steps in every PR. When adding tests:
- Colocate `*.test.tsx` files next to components
- Target critical booking flows + Supabase data transforms
- Run `npm run lint` locally before pushing

## Commit & PR Guidelines

- Commit message format: "Type: short summary" (keep each commit independently revertible)
- PRs must include: problem statement, solution summary, screenshots for UI changes, Supabase migration impacts, tracking issue links
- Note any new environment variables for deploy preview configuration

## First-Time Setup Checklist

Before running the application for the first time:

- [ ] `npm install` to install all dependencies
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Set `ADMIN_EMAILS=your@email.com` in `.env.local`
- [ ] Run `supabase login` (one-time CLI authentication)
- [ ] Run `supabase link --project-ref dotfloiygvhsujlwzqgv`
- [ ] Run `supabase db push` to apply all migrations
- [ ] Run `supabase db query "alter database postgres set app.admin_emails = 'your@email.com';"` (match .env.local)
- [ ] Create test user in Supabase Dashboard → Authentication → Users (Email + Password provider must be enabled)
- [ ] `npm run dev` to start development server
- [ ] Visit `http://localhost:3000` and sign in with test user
- [ ] Visit `http://localhost:3000/admin/codes` to generate initial VIP codes (admin email required)
- [ ] Test VIP code redemption flow

**Common Issues:**
- **Build fails with font errors**: Requires network access to fonts.googleapis.com or local font hosting
- **Admin pages show "Unauthorized"**: Verify `ADMIN_EMAILS` matches database setting exactly (no extra spaces)
- **VIP codes fail to redeem**: Check that migrations 0003 and 0004 ran successfully and RLS policies are active
- **Auth redirects fail**: Ensure Supabase Auth settings include `http://localhost:3000` in allowed redirect URLs
