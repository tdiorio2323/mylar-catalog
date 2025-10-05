-- ONE-SHOT: create missing objects, wire RLS + RPCs, verify, seed, and test

-- ---------- bootstrap (idempotent) ----------
create extension if not exists pgcrypto;

create table if not exists public.admin_emails(
  email text primary key,
  added_at timestamptz default now()
);
insert into public.admin_emails(email)
values ('tyler@tdstudiosny.com')
on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.admin_emails
    where email = auth.jwt()->>'email'
  );
$$;

create table if not exists public.vip_codes(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  role text not null check (role in ('admin','creator','client')),
  uses_allowed int not null default 5,
  uses_remaining int not null default 5,
  expires_at timestamptz not null default now() + interval '30 days',
  created_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.vip_redemptions(
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.vip_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  redeemed_at timestamptz not null default now(),
  ip inet,
  user_agent text
);

alter table public.vip_codes enable row level security;
alter table public.vip_redemptions enable row level security;

-- RLS policies (clean replace)
drop policy if exists vip_codes_admin_read   on public.vip_codes;
drop policy if exists vip_codes_admin_write  on public.vip_codes;
drop policy if exists vip_redeem_admin_read  on public.vip_redemptions;
drop policy if exists vip_redeem_self_insert on public.vip_redemptions;

create policy vip_codes_admin_read  on public.vip_codes
  for select to authenticated using (public.is_admin());

create policy vip_codes_admin_write on public.vip_codes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy vip_redeem_admin_read on public.vip_redemptions
  for select to authenticated using (public.is_admin());

create policy vip_redeem_self_insert on public.vip_redemptions
  for insert to authenticated with check (auth.uid() = user_id);

-- enforce one redemption per user per code
create unique index if not exists idx_vip_redemptions_code_user
  on public.vip_redemptions (code_id, user_id);

-- helpers
create or replace function public.decrement_uses(p_code_id uuid) returns void
language plpgsql as $$
begin
  update public.vip_codes
     set uses_remaining = greatest(uses_remaining - 1, 0)
   where id = p_code_id;
end
$$;

-- RPC: mint (admin only)
create or replace function public.mint_vip_code(
  p_code text,
  p_role text,
  p_uses int,
  p_days int,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  insert into public.vip_codes(code, role, uses_allowed, uses_remaining, expires_at, created_by, metadata)
  values (
    p_code,
    p_role,
    greatest(p_uses,1),
    greatest(p_uses,1),
    now() + make_interval(days => greatest(p_days,1)),
    auth.uid(),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end
$$;

revoke all on function public.mint_vip_code(text,text,int,int,jsonb) from public, anon;
grant execute on function public.mint_vip_code(text,text,int,int,jsonb) to authenticated;

-- RPC: redeem
create or replace function public.redeem_vip_code(
  p_code text,
  p_ip inet default null,
  p_user_agent text default null
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code record;
  v_role text;
begin
  select * into v_code
  from public.vip_codes
  where code = p_code;

  if v_code is null then
    raise exception 'code_not_found';
  end if;

  if v_code.expires_at < now() then
    raise exception 'code_expired';
  end if;

  if v_code.uses_remaining <= 0 then
    raise exception 'code_depleted';
  end if;

  begin
    insert into public.vip_redemptions(code_id, user_id, ip, user_agent)
    values (v_code.id, auth.uid(), p_ip, p_user_agent);
  exception
    when unique_violation then
      raise exception 'already_redeemed';
  end;

  perform public.decrement_uses(v_code.id);
  v_role := v_code.role;
  return v_role;
end
$$;

revoke all on function public.redeem_vip_code(text,inet,text) from public, anon;
grant execute on function public.redeem_vip_code(text,inet,text) to authenticated;

-- seed demo code once
do $$
begin
  if not exists (select 1 from public.vip_codes where code = 'CABANA-ALPHA-0001') then
    insert into public.vip_codes(code, role, uses_allowed, uses_remaining, expires_at, metadata)
    values ('CABANA-ALPHA-0001', 'creator', 25, 25, now() + interval '30 days', '{}'::jsonb);
  end if;
end$$;

-- ---------- verification ----------
-- set editor session to ADMIN for checks
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","email":"tyler@tdstudiosny.com","sub":"11111111-1111-1111-1111-111111111111"}',
  true
);

-- 1) RLS helper should be true
select public.is_admin() as is_admin_should_be_true;

-- 2) RPCs present
select n.nspname as schema, p.proname as name, pg_get_function_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where p.proname in ('mint_vip_code','redeem_vip_code')
order by name;

-- 3) seed another code via RPC
select public.mint_vip_code('CABANA-ALPHA-0002','creator',25,30,'{}'::jsonb) as new_code_id;

-- switch to NON-ADMIN to test redeem
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","email":"client@example.com","sub":"22222222-2222-2222-2222-222222222222"}',
  true
);

-- 4) redeem demo code; returns role string on success
select public.redeem_vip_code('CABANA-ALPHA-0001', null, 'sql-editor') as redeemed_role;

-- 5) show state
select code, role, uses_allowed, uses_remaining, expires_at from public.vip_codes order by created_at desc limit 5;
select code_id, user_id, redeemed_at from public.vip_redemptions order by redeemed_at desc limit 5;
