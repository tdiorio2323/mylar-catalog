#!/usr/bin/env node
/**
 * ONE-SHOT: make both emails admins + seed a working invite
 * Uses service role key to bypass RLS
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env.local manually (no dotenv dependency needed)
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');

const getEnvVar = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const SUPA_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const SERVICE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPA_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPA_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

async function setup() {
  const admins = ['tyler@tdstudiosny.com', 'tyler.diorio@gmail.com'];

  console.log('▶️  Setting up admins with service role...\n');

  // 1. Upsert admin emails (table should exist from migrations)
  console.log('1️⃣  Upserting admin emails...');
  const { error: e1 } = await supabase
    .from('admin_emails')
    .upsert(admins.map(email => ({ email })));

  if (e1) {
    console.error('❌ Error upserting admin_emails:', e1.message);
    console.log('\n💡 Tip: The admin_emails table might not exist yet.');
    console.log('   Run the SQL in scripts/admin-setup.sql first!\n');
    process.exit(1);
  }

  console.log('✅ Admins set:', admins.join(', '));

  // 2. Seed one invite code (if invites table exists)
  console.log('\n2️⃣  Creating seed invite code...');
  const code = 'CABANA-' +
    Math.random().toString(16).slice(2, 6).toUpperCase() +
    '-' +
    Math.random().toString(16).slice(2, 6).toUpperCase();
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: e2 } = await supabase
    .from('invites')
    .insert([{
      code,
      role: 'creator',
      uses_allowed: 5,
      uses_remaining: 5,
      expires_at,
      note: 'Seed invite created by setup script'
    }]);

  if (e2) {
    console.log('⚠️  Invite code not created (table might not exist):', e2.message);
  } else {
    console.log('✅ Seed invite code:', code);
  }

  console.log('\n✅ Setup complete!');
  console.log('\n➡️  Next steps:');
  console.log('   1. npm run dev');
  console.log('   2. Visit /login (both emails are admins)');
  console.log('   3. Visit /dashboard/invite to create more invites');
  console.log('   4. Visit /admin/codes to create VIP codes\n');
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
