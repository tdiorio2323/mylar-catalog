#!/bin/bash

# === 0) FILL THESE TWO EXACT VALUES (single line each, no quotes) ===
SUPA_URL=https://dotfloiygvhsujlwzqgv.supabase.co
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGZsb2l5Z3Zoc3VqbHd6cWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTQ4NzUsImV4cCI6MjA2ODY3MDg3NX0.pMqR9o0kRT6NI3EEDFEbq339ZWWUfijNjoPBN-lf6a0

# === 1) Update Vercel Production envs ===
echo "Removing old environment variables..."
vercel env rm NEXT_PUBLIC_SUPABASE_URL production --yes 2>/dev/null || true
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production --yes 2>/dev/null || true

echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
printf "%s" "$SUPA_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
printf "%s" "$ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# === 2) Redeploy ===
echo "Redeploying to production..."
vercel --prod --yes

# === 3) Sanity check the key directly against Supabase ===
echo "Testing Supabase connection..."
curl -sI "$SUPA_URL/auth/v1/health" | head -n1
curl -s "$SUPA_URL/rest/v1/?apikey=$ANON_KEY" -I | head -n3

echo "✅ Done! Visit https://book.cabanagrp.com/login and hard refresh (Cmd+Shift+R)"
