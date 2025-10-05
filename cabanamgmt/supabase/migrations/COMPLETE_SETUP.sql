-- =============================
-- COMPLETE CABANA SETUP SQL
-- Run this entire file in Supabase Dashboard SQL Editor
-- Safe to re-run (idempotent)
-- =============================

-- =============================
-- MIGRATION 0001: Core Tables
-- =============================

-- Drop existing tables if re-running migration
drop table if exists bookings cascade;
drop table if exists users cascade;

-- Enum for statuses
drop type if exists verification_status cascade;
drop type if exists screening_status cascade;
drop type if exists deposit_status cascade;
drop type if exists interview_status cascade;

create type verification_status as enum ('pending', 'verified', 'failed');
create type screening_status as enum ('pending', 'clear', 'flagged');
create type deposit_status as enum ('pending', 'paid', 'failed', 'refunded');
create type interview_status as enum ('pending', 'scheduled', 'completed', 'failed');

-- Users Table
create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  dob date,
  license_id text,
  selfie_url text,
  verification_status verification_status default 'pending',
  screening_status screening_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_users_email on users(email);
create index idx_users_verification on users(verification_status);
create index idx_users_screening on users(screening_status);

-- Bookings Table
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  slot timestamptz,
  deposit_status deposit_status default 'pending',
  interview_status interview_status default 'pending',
  nda_signed boolean default false,
  payment_intent_id text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_bookings_user on bookings(user_id);
create index idx_bookings_slot on bookings(slot);
create index idx_bookings_deposit on bookings(deposit_status);

-- Triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_users_updated_at
before update on users
for each row
execute function update_updated_at_column();

create trigger set_bookings_updated_at
before update on bookings
for each row
execute function update_updated_at_column();

-- =============================
-- MIGRATION 0003: VIP System
-- =============================

-- 1) Admin allowlist (normalized table instead of GUC)
create table if not exists public.admin_emails (
  email text primary key,
  added_at timestamptz default now()
);

insert into public.admin_emails(email)
values ('tyler@tdstudiosny.com')
on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (select 1 from public.admin_emails where email = auth.jwt()->>'email');
$$;

-- 2) VIP tables
create extension if not exists pgcrypto;

create table if not exists public.vip_codes(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  role text not null check (role in ('admin','creator','client')),
  uses_allowed int not null default 5,
  uses_remaining int not null default 5,
  expires_at timestamptz not null default now() + interval '30 days',
  created_by uuid references auth.users(id),
  metadata jsonb not null default '{}',
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

-- 3) RLS policies
drop policy if exists vip_codes_admin_read   on public.vip_codes;
drop policy if exists vip_codes_admin_write  on public.vip_codes;
drop policy if exists vip_redeem_self_insert on public.vip_redemptions;
drop policy if exists vip_redeem_admin_read  on public.vip_redemptions;

create policy vip_codes_admin_read  on public.vip_codes
  for select to authenticated using (public.is_admin());

create policy vip_codes_admin_write on public.vip_codes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy vip_redeem_admin_read on public.vip_redemptions
  for select to authenticated using (public.is_admin());

create policy vip_redeem_self_insert on public.vip_redemptions
  for insert to authenticated with check (auth.uid() = user_id);

-- 4) Enforce "one redemption per user per code"
with d as (
  select id,
         row_number() over (partition by code_id, user_id order by redeemed_at asc, id asc) rn
  from public.vip_redemptions
)
delete from public.vip_redemptions
where id in (select id from d where rn > 1);

create unique index if not exists idx_vip_redemptions_code_user
  on public.vip_redemptions (code_id, user_id);

-- =============================
-- MIGRATION 0004: VIP Helpers
-- =============================

create or replace function public.decrement_uses(p_code_id uuid) returns void
language plpgsql as $$
begin
  update public.vip_codes
     set uses_remaining = greatest(uses_remaining - 1, 0)
   where id = p_code_id;
end
$$;

-- Mint code (admin only)
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

-- Redeem code (one per user; checks expiry/uses)
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
  select *
    into v_code
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

  -- enforce one redemption per user per code
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

-- 6) Seed one demo code (safe if re-run)
do $$
begin
  if not exists (select 1 from public.vip_codes where code = 'CABANA-ALPHA-0001') then
    insert into public.vip_codes(code, role, uses_allowed, uses_remaining, expires_at, metadata)
    values ('CABANA-ALPHA-0001', 'creator', 25, 25, now() + interval '30 days', '{}'::jsonb);
  end if;
end$$;

-- =============================
-- Setup Complete!
-- =============================
-- Next steps:
-- 1. Enable Email auth: Dashboard → Authentication → Providers → Email
-- 2. Create test user: Dashboard → Authentication → Users → Add user
--    Email: tyler@tdstudiosny.com
--    Password: (your choice)
-- 3. Start app: npm run dev
-- 4. Test at: http://localhost:3000
--
-- Usage from app:
-- * Mint (admin): call RPC mint_vip_code(code, role, uses, days, metadata)
-- * Redeem (any authenticated user): call RPC redeem_vip_code(code, ip, user_agent)
-- =============================
