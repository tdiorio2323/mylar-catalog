#!/bin/bash

SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d= -f2)
SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)

echo "Creating user tyler@tdstudiosny.com..."

curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"tyler@tdstudiosny.com","password":"CabanaAdmin123!","email_confirm":true}'

echo ""
echo ""
echo "User created! Sign in at http://localhost:3000"
echo "Email: tyler@tdstudiosny.com"
echo "Password: CabanaAdmin123!"
