# 🚀 Quick Setup - Run This Now

## Option A: psql (Fastest - No Linking Required)

**Step 1: Get your database password**
https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/settings/database

**Step 2: Run migration (replace YOUR_DB_PASSWORD)**
```bash
cd ~/cabanamgmt

PGPASSWORD='YOUR_DB_PASSWORD' psql \
  "host=aws-0-us-east-2.pooler.supabase.com port=6543 dbname=postgres user=postgres.dotfloiygvhsujlwzqgv sslmode=require" \
  -f supabase/migrations/COMPLETE_SETUP.sql
```

**Step 3: Enable Email Auth**
1. Go to: https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/auth/providers
2. Enable "Email" provider

**Step 4: Start the app**
```bash
npm run dev
```

---

## Option B: Supabase CLI (Alternative)

```bash
cd ~/cabanamgmt
supabase link --project-ref dotfloiygvhsujlwzqgv   # enter DB password when prompted
supabase db push                                    # applies all migrations
npm run dev
```

---

## ✅ After Migration Runs

### Test Admin Access
1. Visit: http://localhost:3000
2. Sign in with: `tyler@tdstudiosny.com` (you should already have this user)
3. Visit admin page: http://localhost:3000/admin/codes
4. You should see the seeded code: `CABANA-ALPHA-0001`

### Create Additional Admin Emails (Optional)
In Supabase SQL Editor, run:
```sql
INSERT INTO public.admin_emails(email)
VALUES ('your-other-admin@example.com');
```

### Test VIP Code Redemption
1. Create a new non-admin test user in Supabase Dashboard
2. Sign in with that user
3. Enter code: `CABANA-ALPHA-0001`
4. Should successfully redeem and show role: `creator`

---

## 🔧 Troubleshooting

**If you get "already exists" errors:**
The migration is idempotent - it's safe. The tables already exist from previous runs.

**If admin access doesn't work:**
Check that `tyler@tdstudiosny.com` exists in the `admin_emails` table:
```sql
SELECT * FROM public.admin_emails;
```

**If migration fails:**
Use the Dashboard SQL Editor instead:
1. https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/editor
2. Copy/paste entire contents of `supabase/migrations/COMPLETE_SETUP.sql`
3. Click RUN
