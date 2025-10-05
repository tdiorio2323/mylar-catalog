#!/bin/bash
# ONE-SHOT: create + test mint_vip_code from your terminal via psql
# (Works on Supabase; prompts for your DB password securely.)

PROJECT_REF="dotfloiygvhsujlwzqgv"
DB_HOST="aws-0-us-east-2.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.${PROJECT_REF}"
ADMIN_EMAIL="tyler@tdstudiosny.com"

echo "This will create the mint_vip_code function in Supabase..."
echo ""
read -s -p "Supabase DB password for ${DB_USER}: " PGPASSWORD
echo ""
export PGPASSWORD

psql "host=${DB_HOST} port=${DB_PORT} dbname=${DB_NAME} user=${DB_USER} sslmode=require" <<'SQL'
-- create/replace admin check helper (expected by RLS)
create table if not exists public.admin_emails(
  email text primary key,
  added_at timestamptz default now()
);
insert into public.admin_emails(email) values ('tyler@tdstudiosny.com'), ('tyler.diorio@gmail.com')
on conflict(email) do nothing;

create or replace function public.is_admin(user_email text) returns boolean
language sql stable as $$
  select exists (select 1 from public.admin_emails where email = user_email);
$$;

-- VIP function your dashboard will call (returns UUID of new code)
create or replace function public.mint_vip_code(
  p_code text default null,
  p_role text default 'client',
  p_uses integer default 5,
  p_expires_at timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
) returns table(code text, role text, uses_allowed int, uses_remaining int, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_expires_at timestamptz;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not public.is_admin(auth.email()) then
    raise exception 'not_admin';
  end if;

  if p_role not in ('admin','creator','client') then
    raise exception 'invalid_role';
  end if;

  if p_code is null or btrim(p_code) = '' then
    v_code := 'CABANA-' ||
              upper(substr(md5(random()::text), 1, 4)) || '-' ||
              upper(substr(md5(random()::text), 1, 4));
  else
    v_code := upper(btrim(p_code));
  end if;

  p_uses := greatest(p_uses, 1);

  if p_expires_at is null then
    v_expires_at := now() + interval '30 days';
  else
    v_expires_at := p_expires_at;
  end if;

  return query
  insert into public.vip_codes (code, role, uses_allowed, uses_remaining, expires_at, created_by, metadata)
  values (v_code, p_role, p_uses, p_uses, v_expires_at, v_user_id, coalesce(p_metadata, '{}'::jsonb))
  returning vip_codes.code, vip_codes.role, vip_codes.uses_allowed, vip_codes.uses_remaining, vip_codes.expires_at;
end
$$;

revoke all on function public.mint_vip_code(text,text,int,timestamptz,jsonb) from public, anon;
grant execute on function public.mint_vip_code(text,text,int,timestamptz,jsonb) to authenticated;

\echo ''
\echo '✅ Function created successfully!'
\echo ''
SQL

echo ""
echo "Function created! Now testing by minting a test code..."
echo ""

# set admin email claim in THIS psql session and mint a test code
psql "host=${DB_HOST} port=${DB_PORT} dbname=${DB_NAME} user=${DB_USER} sslmode=require" <<SQL
select set_config(
  'request.jwt.claims',
  json_build_object('email','${ADMIN_EMAIL}','sub','00000000-0000-0000-0000-000000000000')::text,
  true
);

-- mint an auto-generated creator code (25 uses, 30 days)
select * from public.mint_vip_code(null,'creator',25,now() + interval '30 days','{}'::jsonb) as new_code;

\echo ''
\echo 'Recent codes:'
-- show most recent codes
select code, role, uses_remaining, expires_at::date
from public.vip_codes
order by created_at desc
limit 5;
SQL

unset PGPASSWORD

echo ""
echo "✅ Setup complete! You can now use the VIP Codes page at:"
echo "   https://book.cabanagrp.com/dashboard/codes"
echo ""
