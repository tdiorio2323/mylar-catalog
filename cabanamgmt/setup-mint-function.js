import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dotfloiygvhsujlwzqgv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGZsb2l5Z3Zoc3VqbHd6cWd2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5NDg3NSwiZXhwIjoyMDY4NjcwODc1fQ._h0D0P7oqsUlzPJkCv2ebKYSrJLjI9Bg_4khjRvYysw'
);

const functionSQL = `
CREATE OR REPLACE FUNCTION public.mint_vip_code(
  p_code TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'client',
  p_uses INTEGER DEFAULT 5,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(code TEXT, role TEXT, uses_allowed INTEGER, uses_remaining INTEGER, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  -- Check if user is admin
  IF NOT public.is_admin(auth.email()) THEN
    RAISE EXCEPTION 'Only admins can mint VIP codes';
  END IF;

  -- Generate code if not provided
  IF p_code IS NULL OR p_code = '' THEN
    v_code := 'CABANA-' ||
              upper(substr(md5(random()::text), 1, 4)) || '-' ||
              upper(substr(md5(random()::text), 1, 4));
  ELSE
    v_code := upper(trim(p_code));
  END IF;

  -- Set expiration if not provided
  IF p_expires_at IS NULL THEN
    v_expires_at := now() + interval '30 days';
  ELSE
    v_expires_at := p_expires_at;
  END IF;

  -- Insert the code
  RETURN QUERY
  INSERT INTO public.vip_codes (code, role, uses_allowed, uses_remaining, expires_at, created_by, metadata)
  VALUES (v_code, p_role, p_uses, p_uses, v_expires_at, v_user_id, p_metadata)
  RETURNING vip_codes.code, vip_codes.role, vip_codes.uses_allowed, vip_codes.uses_remaining, vip_codes.expires_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mint_vip_code TO authenticated;
`;

(async () => {
  console.log('Creating mint_vip_code function...\n');

  // Execute the SQL to create the function
  const { error } = await supabase.rpc('exec', { sql: functionSQL }).catch(() => ({
    data: null,
    error: { message: 'exec function not available, will try alternative method' }
  }));

  if (error) {
    console.log('Note: Cannot execute via RPC, you need to run this SQL manually in Supabase SQL Editor:\n');
    console.log('https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/sql/new\n');
    console.log('--- COPY AND PASTE THIS SQL ---\n');
    console.log(functionSQL);
    console.log('\n--- END SQL ---\n');
  } else {
    console.log('✅ Function created successfully!\n');
  }

  // Now test it by signing in as admin and calling it
  console.log('Testing function by signing in as admin and creating a test code...\n');

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'tyler.diorio@gmail.com',
    password: 'Newstart23!'
  });

  if (authError) {
    console.error('❌ Could not sign in:', authError.message);
    return;
  }

  console.log('✅ Signed in as:', authData.user.email);

  // Create a new supabase client with the user's session
  const userSupabase = createClient(
    'https://dotfloiygvhsujlwzqgv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGZsb2l5Z3Zoc3VqbHd6cWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQ4NzUsImV4cCI6MjA2ODY3MDg3NX0.pMqR9o0kRT6NI3EEDFEbq339ZWWUfijNjoPBN-lf6a0',
    {
      global: {
        headers: {
          Authorization: `Bearer ${authData.session.access_token}`
        }
      }
    }
  );

  // Test calling the function
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data: codeData, error: codeError } = await userSupabase.rpc('mint_vip_code', {
    p_code: null, // Will auto-generate
    p_role: 'creator',
    p_uses: 25,
    p_expires_at: expiresAt.toISOString(),
    p_metadata: {}
  });

  if (codeError) {
    console.error('\n❌ Error minting code:', codeError.message);
    console.log('\nYou may need to run the SQL manually in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/sql/new\n');
  } else {
    console.log('\n✅ Test code created successfully!');
    console.log('Code:', codeData);
  }
})();
