-- =============================
-- INVITATIONS SYSTEM (M1)
-- =============================

-- Create invites table
CREATE TABLE IF NOT EXISTS public.invites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'creator', 'client')),
    code text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    invited_by uuid REFERENCES auth.users(id),
    redeemed_by uuid REFERENCES auth.users(id),
    redeemed_at timestamptz,
    meta jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Constraint: only one active invite per email
    CONSTRAINT unique_email_active UNIQUE (email) WHERE redeemed_at IS NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invites_code ON public.invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_expires ON public.invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_invites_redeemed ON public.invites(redeemed_at);

-- RLS Policies
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Admin can insert and view all invites
CREATE POLICY "Admins can manage invites" ON public.invites
    FOR ALL USING (public.is_admin(auth.email()));

-- Users can view invites sent to their email
CREATE POLICY "Users can view own invites" ON public.invites
    FOR SELECT USING (email = auth.email());

-- RPC: create_invite (admin only)
CREATE OR REPLACE FUNCTION public.create_invite(
    p_email text,
    p_role text DEFAULT 'client',
    p_days int DEFAULT 14,
    p_meta jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_email text;
    v_code text;
    v_id uuid;
    v_days int;
BEGIN
    -- Check admin permissions
    IF NOT public.is_admin(auth.email()) THEN 
        RAISE EXCEPTION 'not_admin'; 
    END IF;
    
    -- Validate role
    IF p_role NOT IN ('admin','creator','client') THEN 
        RAISE EXCEPTION 'invalid_role'; 
    END IF;
    
    -- Clean and validate email
    v_email := lower(btrim(p_email));
    IF v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'invalid_email';
    END IF;
    
    -- Validate days
    v_days := greatest(coalesce(p_days, 14), 1);

    -- Generate unique code
    v_code := 'INV-' || 
              upper(substr(md5(gen_random_uuid()::text), 1, 6)) || 
              '-' || 
              upper(substr(md5(now()::text), 1, 4));

    -- Insert invite
    INSERT INTO public.invites(email, role, code, expires_at, invited_by, meta)
    VALUES (v_email, p_role, v_code, now() + make_interval(days => v_days), auth.uid(), coalesce(p_meta, '{}'::jsonb))
    RETURNING id INTO v_id;

    RETURN v_id;
END$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.create_invite(text,text,int,jsonb) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_invite(text,text,int,jsonb) TO authenticated;

-- RPC: accept_invite (authenticated user)
CREATE OR REPLACE FUNCTION public.accept_invite(p_code text)
RETURNS text -- returns granted role
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_inv public.invites%rowtype;
    v_role text;
    v_user_email text;
BEGIN
    -- Check authentication
    IF auth.uid() IS NULL THEN 
        RAISE EXCEPTION 'not_authenticated'; 
    END IF;

    -- Get user email
    v_user_email := auth.email();
    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'no_email_in_jwt';
    END IF;

    -- Find invite
    SELECT * INTO v_inv FROM public.invites WHERE code = btrim(p_code);
    IF NOT FOUND THEN 
        RAISE EXCEPTION 'code_not_found'; 
    END IF;
    
    -- Check if already redeemed
    IF v_inv.redeemed_at IS NOT NULL THEN 
        RAISE EXCEPTION 'already_redeemed'; 
    END IF;
    
    -- Check expiration
    IF v_inv.expires_at < now() THEN 
        RAISE EXCEPTION 'code_expired'; 
    END IF;
    
    -- Check email match
    IF v_inv.email != v_user_email THEN
        RAISE EXCEPTION 'email_mismatch';
    END IF;

    -- Mark as redeemed
    UPDATE public.invites
    SET redeemed_by = auth.uid(), redeemed_at = now()
    WHERE id = v_inv.id;

    v_role := v_inv.role;

    -- If admin invite, add to admin_emails allowlist
    IF v_role = 'admin' THEN
        INSERT INTO public.admin_emails(email) 
        VALUES (v_inv.email)
        ON CONFLICT (email) DO NOTHING;
    END IF;

    RETURN v_role;
END$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.accept_invite(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.accept_invite(text) TO authenticated;

-- Update trigger for invites
CREATE TRIGGER set_invites_updated_at
    BEFORE UPDATE ON public.invites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================
-- VERIFICATION QUERIES
-- =============================
-- Test admin invite creation:
-- SELECT set_config('request.jwt.claims', json_build_object('email','tyler@tdstudiosny.com')::text, true);
-- SELECT public.create_invite('test@example.com','client',14,'{}');