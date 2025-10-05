#!/bin/bash
# Setup Invitations System - Run SQL migration

PROJECT_REF="dotfloiygvhsujlwzqgv"
DB_HOST="aws-0-us-east-2.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.${PROJECT_REF}"

echo "🚀 Setting up Invitations System..."
echo ""
read -s -p "Supabase DB password for ${DB_USER}: " PGPASSWORD
echo ""
export PGPASSWORD

# Run the migration
psql "host=${DB_HOST} port=${DB_PORT} dbname=${DB_NAME} user=${DB_USER} sslmode=require" -f supabase/migrations/0006_invitations.sql

echo ""
echo "Testing invite functions..."

# Test the functions
psql "host=${DB_HOST} port=${DB_PORT} dbname=${DB_NAME} user=${DB_USER} sslmode=require" <<SQL
-- Set admin session for testing
SELECT set_config(
  'request.jwt.claims',
  json_build_object('email','tyler@tdstudiosny.com','sub','00000000-0000-0000-0000-000000000000')::text,
  true
);

-- Test creating an invite
SELECT public.create_invite('test@example.com','client',14,'{}') as invite_id;

-- Show recent invites
SELECT code, email, role, expires_at::date, redeemed_at
FROM public.invites
ORDER BY created_at DESC
LIMIT 3;
SQL

unset PGPASSWORD

echo ""
echo "✅ Invitations system setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Visit https://book.cabanagrp.com/dashboard/invite to create invites"
echo "   2. Test invite redemption at /invite/[code]"
echo ""