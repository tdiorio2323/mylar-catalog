#!/bin/bash
set -e

echo "🚀 Running Cabana Database Migration"
echo "====================================="
echo ""

# Database connection details
DB_HOST="aws-0-us-east-2.pooler.supabase.com"
DB_PORT="6543"
DB_USER="postgres.dotfloiygvhsujlwzqgv"
DB_NAME="postgres"

echo "📋 This will run the complete setup migration on your Supabase database"
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
PGPASSWORD="" psql \
  "postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=require" \
  -f supabase/migrations/COMPLETE_SETUP.sql

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Enable Email auth: Dashboard → Authentication → Providers → Email"
echo "   2. Create test user: Dashboard → Authentication → Users → Add user"
echo "      Email: tyler@tdstudiosny.com"
echo "      Password: (your choice)"
echo "   3. Start app: npm run dev"
echo "   4. Test at: http://localhost:3000"
echo ""
