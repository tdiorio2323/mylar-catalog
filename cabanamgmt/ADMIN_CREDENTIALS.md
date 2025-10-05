# 🔐 Cabana Admin Credentials

**CONFIDENTIAL - DO NOT COMMIT TO GIT**

---

## Admin Account

**Email:** tyler@tdstudiosny.com
**Password:** Newstart23!
**Role:** Super Admin
**Created:** 2025-10-04

---

## How to Set This Password in Supabase

1. **Go to:** https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/auth/users

2. **Find user:** tyler@tdstudiosny.com

3. **Click the three dots** (⋯) next to the user

4. **Select "Reset Password"** or **"Edit User"**

5. **Set password to:** `Newstart23!`

6. **Save changes**

7. **Sign in at:** http://localhost:3000

---

## VIP Admin Codes (Already Seeded)

### Demo Codes
- `CABANA-ALPHA-0001` - Creator role, 25 uses, expires in 30 days
- `CABANA-ALPHA-0002` - Creator role, 25 uses, expires in 30 days

### How to Mint New Codes
1. Sign in at http://localhost:3000
2. Go to http://localhost:3000/admin/codes
3. Click "Mint New Code"
4. Fill in:
   - **Code:** (e.g., `CABANA-BETA-001`)
   - **Role:** creator / admin / client
   - **Uses:** Number of redemptions allowed
   - **Valid Days:** How long code is valid

---

## Admin Code Format Recommendations

```
CABANA-{TIER}-{SERIAL}

Examples:
- CABANA-ALPHA-0001  (Early access)
- CABANA-BETA-0001   (Beta testers)
- CABANA-VIP-0001    (VIP clients)
- CABANA-CREATOR-001 (Creator invites)
- CABANA-STAFF-001   (Internal staff)
```

---

## Security Notes

- ✅ Admin email in `admin_emails` table (RLS protected)
- ⚠️  Change password after first login if sharing access
- ⚠️  Enable 2FA when available in Supabase

---

**Last Updated:** 2025-10-04

---

## Additional Admin Account

**Email:** tyler.diorio@gmail.com
**Password:** Newstart23!
**Role:** Super Admin
**Created:** 2025-10-04

