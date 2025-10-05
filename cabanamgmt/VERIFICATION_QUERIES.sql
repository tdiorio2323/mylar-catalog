-- =============================
-- POST-MIGRATION VERIFICATION
-- Run these queries AFTER running COMPLETE_SETUP.sql
-- =============================

-- 1) Check admin_emails table exists and has your email
SELECT 'admin_emails table' AS check_name, email, added_at
FROM public.admin_emails;
-- Expected: tyler@tdstudiosny.com

-- 2) Check VIP tables exist
SELECT 'vip_codes table' AS check_name, COUNT(*) AS count
FROM public.vip_codes;
-- Expected: 1 (CABANA-ALPHA-0001)

SELECT 'vip_redemptions table' AS check_name, COUNT(*) AS count
FROM public.vip_redemptions;
-- Expected: 0 (no redemptions yet)

-- 3) Check functions exist
SELECT 'RPC functions' AS check_name, proname, proargnames
FROM pg_proc
WHERE proname IN ('mint_vip_code', 'redeem_vip_code', 'is_admin', 'decrement_uses');
-- Expected: 4 functions

-- 4) Check demo code was seeded
SELECT 'Demo VIP code' AS check_name, code, role, uses_remaining, expires_at
FROM public.vip_codes
WHERE code = 'CABANA-ALPHA-0001';
-- Expected: 1 row with 25 uses remaining

-- 5) Test is_admin() function (should return TRUE for tyler@tdstudiosny.com)
-- Note: This only works if you're signed in as tyler@tdstudiosny.com
-- SELECT public.is_admin();

-- =============================
-- If all checks pass, you can:
-- 1. Visit http://localhost:3000
-- 2. Sign in as tyler@tdstudiosny.com
-- 3. Go to /admin/codes
-- 4. Mint new codes or test with CABANA-ALPHA-0001
-- =============================
