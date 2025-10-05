-- Create mint_vip_code function for dashboard
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.mint_vip_code TO authenticated;
