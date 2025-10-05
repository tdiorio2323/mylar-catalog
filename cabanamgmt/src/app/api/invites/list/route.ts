import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  const cookieStore = await cookies()
  const ssr = createServerClient(url, anon, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      }
    }
  })
  const { data: { session } } = await ssr.auth.getSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  const { data: adminOK } = await ssr.from('admin_emails').select('email').eq('email', session.user.email).maybeSingle()
  if (!adminOK) return NextResponse.json({ error: 'not_admin' }, { status: 403 })

  const svc = createClient(url, service, { auth: { persistSession: false } })
  const { data: invites, error } = await svc.from('invites').select('*').order('created_at', { ascending: false }).limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ invites })
}