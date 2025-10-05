-- INVITATIONS (idempotent)
create table if not exists public.invites (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  email         text,
  role          text not null check (role in ('admin','creator','client')),
  uses_allowed  int  not null default 1,
  uses_remaining int not null default 1,
  expires_at    timestamptz not null default now() + interval '30 days',
  note          text default null,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);

create table if not exists public.invite_redemptions (
  id           uuid primary key default gen_random_uuid(),
  invite_id    uuid not null references public.invites(id) on delete cascade,
  user_id      uuid not null references auth.users(id),
  redeemed_at  timestamptz not null default now(),
  ip           inet,
  user_agent   text
);

alter table public.invites           enable row level security;
alter table public.invite_redemptions enable row level security;

-- is_admin() already exists (normalized admin_emails table). Keep using it.
drop policy if exists invites_admin_all on public.invites;
create policy invites_admin_all on public.invites
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists invite_redeem_insert on public.invite_redemptions;
create policy invite_redeem_insert on public.invite_redemptions
  for insert to authenticated
  with check (auth.uid() = user_id);

drop index if exists idx_invite_redemptions_unique;
create unique index if not exists idx_invite_redemptions_unique
  on public.invite_redemptions (invite_id, user_id);

-- Function to decrement uses_remaining
create or replace function public.decrement_uses(p_code_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.invites 
  set uses_remaining = greatest(0, uses_remaining - 1)
  where id = p_code_id;
end;
$$;