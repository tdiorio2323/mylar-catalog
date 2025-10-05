#!/bin/bash
set -e

echo "🚀 Cabana Management Platform - Setup Script"
echo "=============================================="
echo ""

# 0) Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it with:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not installed (optional). Install with: brew install jq"
fi

# 1) Link Supabase project
echo ""
echo "🔗 Step 1: Linking to Supabase project..."
echo "   (You'll be prompted for your database password)"
echo ""
supabase link --project-ref dotfloiygvhsujlwzqgv || {
    echo ""
    echo "⚠️  CLI link failed. You can run migrations manually via Dashboard:"
    echo "   https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/editor"
    echo ""
    echo "   Execute these SQL files in order:"
    echo "   1. supabase/migrations/0001_init.sql"
    echo "   2. supabase/migrations/0003_vip.sql"
    echo "   3. supabase/migrations/0004_vip_helpers.sql"
    echo ""
}

# 2) Push migrations
echo ""
echo "📤 Step 2: Pushing database migrations..."
supabase db push || {
    echo "⚠️  Migration push failed. Run manually via dashboard (see link above)"
}

# 3) Set admin allowlist
echo ""
echo "👤 Step 3: Setting admin email allowlist..."
ADMIN_EMAILS="tyler@tdstudiosny.com"
supabase db query "alter database postgres set app.admin_emails = '$ADMIN_EMAILS';" || {
    echo "⚠️  Failed to set admin emails. Run this SQL manually in dashboard:"
    echo "   alter database postgres set app.admin_emails = '$ADMIN_EMAILS';"
}

# 4) Verify environment
echo ""
echo "🔍 Step 4: Verifying .env.local configuration..."
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local 2>/dev/null; then
    echo "❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local"
    exit 1
fi

if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ" .env.local 2>/dev/null; then
    echo "❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    exit 1
fi

if ! grep -q "SUPABASE_SERVICE_ROLE_KEY=eyJ" .env.local 2>/dev/null; then
    echo "❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local"
    exit 1
fi

echo "✅ Environment variables configured"

# 5) Create test user
echo ""
echo "👥 Step 5: Creating test admin user..."
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d= -f2)
SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)

curl -s -X POST \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"tyler@tdstudiosny.com","password":"CabanaTest123","email_confirm":true}' \
  "$SUPABASE_URL/auth/v1/admin/users" | {
    if command -v jq &> /dev/null; then
        jq '.'
    else
        cat
    fi
} || echo "⚠️  User creation failed (may already exist)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start dev server:    npm run dev"
echo "   2. Visit:              http://localhost:3000"
echo "   3. Sign in with:       tyler@tdstudiosny.com / CabanaTest123"
echo "   4. Admin panel:        http://localhost:3000/admin/codes"
echo ""
echo "🔑 Test Credentials:"
echo "   Email:    tyler@tdstudiosny.com"
echo "   Password: CabanaTest123"
echo ""
