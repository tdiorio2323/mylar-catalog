import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const service = process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}))
    const { email = null, role = 'client', uses = 1, days = 30, note = null, code: rawCode } = body

    // session (to check admin)
    const cookieStore = await cookies()
    const supaSSR = createServerClient(url, anon, {
        cookies: {
            getAll() { return cookieStore.getAll() },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options)
                })
            }
        }
    })
    const { data: { session } } = await supaSSR.auth.getSession()
    const sessionEmail = session?.user?.email ?? null

    if (!sessionEmail) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

    const { data: adminOK } = await supaSSR
        .from('admin_emails').select('email').eq('email', sessionEmail).maybeSingle()

    if (!adminOK) return NextResponse.json({ error: 'not_admin' }, { status: 403 })

    // write with service role
    const svc = createClient(url, service, { auth: { persistSession: false } })
    const upper = (s: string) => s.toUpperCase().trim()
    const code = rawCode?.trim()
        ? upper(rawCode)
        : `CABANA-${Math.random().toString(16).slice(2, 6).toUpperCase()}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`

    const daysInt = Math.max(1, parseInt(String(days), 10) || 30)
    const usesInt = Math.max(1, parseInt(String(uses), 10) || 1)
    const expires_at = new Date(Date.now() + daysInt * 86400000).toISOString()

    const { data: me } = await supaSSR.auth.getUser()
    const created_by = me.user?.id ?? null

    const { data, error } = await svc
        .from('invites')
        .insert({ code, email, role, uses_allowed: usesInt, uses_remaining: usesInt, expires_at, note, created_by })
        .select('*')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ invite: data })
}