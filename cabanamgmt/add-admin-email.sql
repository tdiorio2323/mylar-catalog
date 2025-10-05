-- Add tyler.diorio@gmail.com to admin_emails table
INSERT INTO public.admin_emails(email)
VALUES ('tyler.diorio@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Verify both admin emails are present
SELECT * FROM public.admin_emails ORDER BY email;
