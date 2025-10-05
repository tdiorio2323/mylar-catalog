# 🚀 Deploying Cabana Management to book.cabanagrp.com

## Quick Deploy Steps

### Step 1: Deploy to Vercel (5 minutes)

**Option A: Vercel CLI (Fastest)**
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import Git Repository (or drag & drop project folder)
3. Configure Project:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dotfloiygvhsujlwzqgv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-key>
   STRIPE_SECRET_KEY=<your-stripe-secret>
   ADMIN_EMAILS=tyler@tdstudiosny.com,tyler.diorio@gmail.com
   NEXT_PUBLIC_BASE_URL=https://book.cabanagrp.com
   ```

5. Click **Deploy**

---

### Step 2: Get Vercel DNS Record

After deployment, Vercel will give you a deployment URL like:
```
cabana-management-abc123.vercel.app
```

Go to your Vercel project settings:
1. Settings → Domains
2. Add Domain: `book.cabanagrp.com`
3. Vercel will show you the CNAME record to add

It will look like:
```
CNAME: book.cabanagrp.com → cname.vercel-dns.com
```

---

### Step 3: Add DNS Record in Cloudflare

1. Go to Cloudflare DNS: https://dash.cloudflare.com
2. Select domain: `cabanagrp.com`
3. Add new record:
   ```
   Type: CNAME
   Name: book
   Target: <vercel-dns-from-step-2> (e.g., cname.vercel-dns.com)
   Proxy status: DNS only (gray cloud) OR Proxied (orange cloud)
   TTL: Auto
   ```

4. Save

---

### Step 4: Verify in Vercel

1. Go back to Vercel → Settings → Domains
2. Wait for DNS propagation (usually 1-5 minutes)
3. Vercel will automatically:
   - Verify DNS
   - Issue SSL certificate
   - Deploy to custom domain

---

## Alternative: Quick Vercel CLI Deployment

```bash
cd ~/cabanamgmt

# Login
vercel login

# First deployment (creates project)
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add ADMIN_EMAILS production
vercel env add NEXT_PUBLIC_BASE_URL production

# Add domain
vercel domains add book.cabanagrp.com

# This will output the CNAME record to add in Cloudflare
```

---

## Troubleshooting

### Build Fails with Font Errors
If you see `getaddrinfo ENOTFOUND fonts.googleapis.com`:

**Solution 1: Add buildCommand to vercel.json**
```json
{
  "buildCommand": "NEXT_TURBOPACK=0 npm run build"
}
```

**Solution 2: Host fonts locally** (recommended for production)
See `CLAUDE.md` for instructions on downloading fonts to `public/fonts/`

### Domain Not Verifying
- Wait 5-10 minutes for DNS propagation
- Check DNS with: `dig book.cabanagrp.com`
- Ensure CNAME target matches Vercel's requirement exactly

### SSL Certificate Pending
- Vercel auto-issues SSL via Let's Encrypt
- Takes 1-5 minutes after DNS verification
- Can't be forced, must wait

---

## Post-Deployment Checklist

- [ ] Visit https://book.cabanagrp.com
- [ ] Test sign in with tyler@tdstudiosny.com
- [ ] Verify admin access at /admin/codes
- [ ] Test VIP code creation
- [ ] Check all environment variables are set
- [ ] Verify Supabase connection works
- [ ] Test password reset flow
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit
- [ ] Set up monitoring (Sentry, etc.)

---

## Current DNS Records for Reference

Based on your Cloudflare setup:
- `cabanagrp.com` → 216.198.79.1 (A record)
- `colombia.cabanagrp.com` → Vercel
- `early.cabanagrp.com` → Vercel
- `talent.cabanagrp.com` → Vercel
- `vip.cabanagrp.com` → Vercel
- `www.cabanagrp.com` → Vercel

**New record to add:**
- `book.cabanagrp.com` → Vercel CNAME (from Step 2)

---

## Quick Command Summary

```bash
# Deploy with Vercel CLI
vercel login
vercel --prod

# Add domain
vercel domains add book.cabanagrp.com

# Check deployment
vercel ls

# View logs
vercel logs <deployment-url>
```

---

**Ready to deploy!** 🚀

Start with `vercel login` and follow the prompts.
