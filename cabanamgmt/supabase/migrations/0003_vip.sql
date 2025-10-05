-- Admin allowlist (set your emails at end of file)
create extension if not exists pgcrypto;
create table if not exists vip_codes(
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
create table if not exists vip_redemptions(
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references vip_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  redeemed_at timestamptz not null default now(),
  ip inet,
  user_agent text
);
alter table vip_codes enable row level security;
alter table vip_redemptions enable row level security;

create or replace function is_admin() returns boolean language sql stable as $$
  select auth.jwt()->>'email' = any (string_to_array(coalesce(current_setting('app.admin_emails', true),'admin@example.com'), ','));
$$;

drop policy if exists vip_codes_admin_read on vip_codes;
drop policy if exists vip_codes_admin_insert on vip_codes;
drop policy if exists vip_codes_admin_update on vip_codes;
drop policy if exists vip_redemptions_admin_read on vip_redemptions;
drop policy if exists vip_redemptions_self_insert on vip_redemptions;

create policy vip_codes_admin_read   on vip_codes       for select to authenticated using (is_admin());
create policy vip_codes_admin_insert on vip_codes       for insert  to authenticated with check (is_admin());
create policy vip_codes_admin_update on vip_codes       for update  to authenticated using (is_admin()) with check (is_admin());
create policy vip_redemptions_admin_read on vip_redemptions for select to authenticated using (is_admin());
create policy vip_redemptions_self_insert on vip_redemptions for insert to authenticated with check (auth.uid() = user_id);

-- persistent admin list (edit emails)
alter database postgres set app.admin_emails = 'tyler@tdstudiosny.com';
