-- MINT VIP CODE (admin-only)
-- Creates a code row in public.vip_codes and returns its id.
-- Safe to re-run (CREATE OR REPLACE).

create or replace function public.mint_vip_code(
  p_code     text    default null,          -- optional custom code; auto-generated if null/blank
  p_role     text    default 'client',      -- 'admin' | 'creator' | 'client'
  p_uses     integer default 5,             -- total uses allowed (>=1)
  p_days     integer default 30,            -- expires in N days (>=1)
  p_metadata jsonb   default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code       text;
  v_expires_at timestamptz;
  v_user_id    uuid;
  v_id         uuid;
begin
  -- must be signed in
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  -- must be admin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  -- validate role against table check constraint
  if p_role not in ('admin','creator','client') then
    raise exception 'invalid_role';
  end if;

  -- normalize + generate code if needed
  if p_code is null or btrim(p_code) = '' then
    v_code := 'CABANA-' ||
              upper(substr(md5(random()::text), 1, 4)) || '-' ||
              upper(substr(md5(random()::text), 1, 4));
  else
    v_code := upper(btrim(p_code));
  end if;

  -- normalize numeric inputs
  p_uses := greatest(p_uses, 1);
  p_days := greatest(p_days, 1);

  v_expires_at := now() + make_interval(days => p_days);

  insert into public.vip_codes (code, role, uses_allowed, uses_remaining, expires_at, created_by, metadata)
  values (v_code, p_role, p_uses, p_uses, v_expires_at, v_user_id, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_id;

  return v_id;
end
$$;

-- lock it down
revoke all on function public.mint_vip_code(text,text,int,int,jsonb) from public, anon;
grant execute on function public.mint_vip_code(text,text,int,int,jsonb) to authenticated;

-- Quick verify (run below it)
-- should list the function
select n.nspname as schema, p.proname as name, pg_get_function_arguments(p.oid) as args
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'mint_vip_code';

-- simulate admin JWT in SQL editor, expect success:
select set_config('request.jwt.claims','{"email":"tyler@tdstudiosny.com"}', true);
select public.mint_vip_code(null,'creator',25,30,'{}'::jsonb) as new_code_id;