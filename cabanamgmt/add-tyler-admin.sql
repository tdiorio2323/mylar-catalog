-- Add tyler.diorio@gmail.com as admin user
-- Run this in Supabase Dashboard > SQL Editor

-- First check what's currently in admin_emails
SELECT 'Current admin emails:' AS info;
SELECT email, added_at FROM public.admin_emails ORDER BY added_at;

-- Add tyler.diorio@gmail.com if it doesn't exist
INSERT INTO public.admin_emails (email)
VALUES ('tyler.diorio@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Verify it was added
SELECT 'After adding tyler.diorio@gmail.com:' AS info;
SELECT email, added_at FROM public.admin_emails ORDER BY email;

-- Test the is_admin function
SELECT 'Testing is_admin function:' AS info;
SELECT is_admin('tyler.diorio@gmail.com') AS tyler_is_admin;
SELECT is_admin('tyler@tdstudiosny.com') AS tyler_td_is_admin;
