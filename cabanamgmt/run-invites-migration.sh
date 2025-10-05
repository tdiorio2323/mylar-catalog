#!/bin/bash
set -e

echo "🚀 Running Invitations System Migration (M1)"
echo "=============================================="
echo ""

# Database connection details
DB_HOST="aws-0-us-east-2.pooler.supabase.com"
DB_PORT="6543"
DB_USER="postgres.dotfloiygvhsujlwzqgv"
DB_NAME="postgres"

echo "📋 This will create the invitations system tables and functions"
echo ""
echo "Connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT" 
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""
echo "You will be prompted for your database password."
echo "Find it at: https://supabase.com/dashboard/project/dotfloiygvhsujlwzqgv/settings/database"
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."

# Run the migration
psql "postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=require" \
  -f supabase/migrations/0005_invites.sql

echo ""
echo "✅ Invitations system migration completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Visit your dashboard at /dashboard/invites to create invitations"
echo "   2. Test invite redemption at /invite/[CODE]"
echo "   3. M1 (Invitations System) is now complete!"
echo ""