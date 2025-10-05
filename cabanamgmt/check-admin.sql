-- Check admin_emails table
SELECT 'Current admin emails:' AS info;
SELECT email, added_at FROM public.admin_emails ORDER BY added_at;

-- Check if both emails exist
SELECT 
  'tyler@tdstudiosny.com exists:' AS check_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.admin_emails WHERE email = 'tyler@tdstudiosny.com') 
    THEN 'YES ✅' 
    ELSE 'NO ❌' 
  END AS result;

SELECT 
  'tyler.diorio@gmail.com exists:' AS check_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM public.admin_emails WHERE email = 'tyler.diorio@gmail.com') 
    THEN 'YES ✅' 
    ELSE 'NO ❌' 
  END AS result;

-- Add tyler.diorio@gmail.com if it doesn't exist
INSERT INTO public.admin_emails (email) 
VALUES ('tyler.diorio@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Verify both emails are now present
SELECT 'Final verification:' AS info;
SELECT email, added_at FROM public.admin_emails ORDER BY email;