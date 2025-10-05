-- ========================================
-- CABANA ADMIN SETUP SQL
-- Run this in Supabase Dashboard → SQL Editor
-- ========================================

-- 1. Create admin_emails table
create table if not exists public.admin_emails(
  email text primary key,
  added_at timestamptz default now()
);

-- 2. Insert admin emails
insert into public.admin_emails(email) values
  ('tyler@tdstudiosny.com'),
  ('tyler.diorio@gmail.com')
on conflict do nothing;

-- 3. Create is_admin helper function
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (select 1 from public.admin_emails where email = auth.jwt()->>'email');
$$;

-- 4. Ensure unique redemptions
create unique index if not exists idx_vip_redemptions_code_user
  on public.vip_redemptions (code_id, user_id);

-- 5. Create VIP code minting function
create or replace function public.mint_vip_code(
  p_code text default null,
  p_role text default 'client',
  p_uses integer default 5,
  p_days integer default 30,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_expires_at timestamptz;
  v_user_id uuid;
  v_id uuid;
begin
  -- Check authentication
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  -- Check admin status
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  -- Validate role
  if p_role not in ('admin','creator','client') then
    raise exception 'invalid_role';
  end if;

  -- Generate code if not provided
  v_code := case when p_code is null or btrim(p_code) = '' then
    'CABANA-'||upper(substr(md5(random()::text),1,4))||'-'||upper(substr(md5(random()::text),1,4))
  else
    upper(btrim(p_code))
  end;

  -- Ensure positive values
  p_uses := greatest(p_uses, 1);
  p_days := greatest(p_days, 1);
  v_expires_at := now() + make_interval(days => p_days);

  -- Insert the code
  insert into public.vip_codes(
    code,
    role,
    uses_allowed,
    uses_remaining,
    expires_at,
    created_by,
    metadata
  )
  values (
    v_code,
    p_role,
    p_uses,
    p_uses,
    v_expires_at,
    v_user_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end $$;

-- Set permissions
revoke all on function public.mint_vip_code(text,text,int,int,jsonb) from public, anon;
grant execute on function public.mint_vip_code(text,text,int,int,jsonb) to authenticated;

-- 6. Create decrement_uses helper
create or replace function public.decrement_uses(p_code_id uuid) returns void
language plpgsql as $$
begin
  update public.vip_codes
  set uses_remaining = greatest(uses_remaining - 1, 0)
  where id = p_code_id;
end $$;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check admin emails
select * from public.admin_emails;

-- Test is_admin function (run after login)
-- select public.is_admin();

-- View existing VIP codes
select code, role, uses_remaining, expires_at, created_at
from public.vip_codes
order by created_at desc
limit 10;
