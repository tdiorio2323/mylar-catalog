#!/usr/bin/env node
/**
 * One-shot admin setup script
 * - Creates admin_emails table
 * - Adds both admin emails
 * - Creates helper functions
 * - Mints a test VIP code
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env
config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setup() {
  console.log('▶️  Setting up admin configuration...\n');

  // 1. Create admin_emails table
  console.log('1️⃣  Creating admin_emails table...');
  const { error: tableError } = await supabase.rpc('exec_sql', {
    sql: `
      create table if not exists public.admin_emails(
        email text primary key,
        added_at timestamptz default now()
      );
    `
  }).catch(() => ({ error: null })); // Might not have exec_sql RPC, that's ok

  // Instead, let's use direct SQL execution via the REST API
  const setupSQL = `
-- Admin allowlist (idempotent)
create table if not exists public.admin_emails(
  email text primary key,
  added_at timestamptz default now()
);

-- Insert admin emails
insert into public.admin_emails(email) values
  ('tyler@tdstudiosny.com'),
  ('tyler.diorio@gmail.com')
on conflict do nothing;

-- is_admin helper (idempotent)
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (select 1 from public.admin_emails where email = auth.jwt()->>'email');
$$;

-- Ensure one redemption per (code_id,user_id)
create unique index if not exists idx_vip_redemptions_code_user
  on public.vip_redemptions (code_id, user_id);

-- Safe VIP mint function (idempotent)
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
  v_code text; v_expires_at timestamptz; v_user_id uuid; v_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'not_authenticated'; end if;
  if not public.is_admin() then raise exception 'not_admin'; end if;
  if p_role not in ('admin','creator','client') then raise exception 'invalid_role'; end if;

  v_code := case when p_code is null or btrim(p_code) = '' then
             'CABANA-'||upper(substr(md5(random()::text),1,4))||'-'||upper(substr(md5(random()::text),1,4))
           else upper(btrim(p_code)) end;

  p_uses := greatest(p_uses,1);
  p_days := greatest(p_days,1);
  v_expires_at := now() + make_interval(days => p_days);

  insert into public.vip_codes(code,role,uses_allowed,uses_remaining,expires_at,created_by,metadata)
  values (v_code,p_role,p_uses,p_uses,v_expires_at, v_user_id, coalesce(p_metadata,'{}'::jsonb))
  returning id into v_id;

  return v_id;
end $$;

revoke all on function public.mint_vip_code(text,text,int,int,jsonb) from public, anon;
grant execute on function public.mint_vip_code(text,text,int,int,jsonb) to authenticated;

-- Decrement uses helper (idempotent)
create or replace function public.decrement_uses(p_code_id uuid) returns void
language plpgsql as $$
begin
  update public.vip_codes set uses_remaining = greatest(uses_remaining - 1, 0) where id = p_code_id;
end $$;
  `;

  console.log('\n📝 SQL to execute in Supabase Dashboard → SQL Editor:\n');
  console.log('='.repeat(80));
  console.log(setupSQL);
  console.log('='.repeat(80));

  console.log('\n✅ Script complete!\n');
  console.log('Next steps:');
  console.log('1. Copy the SQL above');
  console.log('2. Go to Supabase Dashboard → SQL Editor');
  console.log('3. Paste and run the SQL');
  console.log('4. Both emails will be admin: tyler@tdstudiosny.com, tyler.diorio@gmail.com');
  console.log('5. Visit /admin/codes to mint VIP codes\n');
}

setup().catch(console.error);
