import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: Request) {
    const { code } = await req.json().catch(() => ({}))
    if (!code) return NextResponse.json({ error: 'missing_code' }, { status: 400 })

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
    const user = session?.user
    if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

    const svc = createClient(url, service, { auth: { persistSession: false } })
    const { data: invite, error } = await svc.from('invites').select('*').eq('code', code.toUpperCase().trim()).single()
    if (error || !invite) return NextResponse.json({ error: 'code_not_found' }, { status: 404 })
    if (new Date(invite.expires_at).getTime() < Date.now()) return NextResponse.json({ error: 'code_expired' }, { status: 400 })
    if (invite.uses_remaining <= 0) return NextResponse.json({ error: 'code_depleted' }, { status: 400 })

    // one per user per invite
    const { data: existing } = await svc
        .from('invite_redemptions')
        .select('id')
        .eq('invite_id', invite.id)
        .eq('user_id', user.id)
        .maybeSingle()
    if (existing) return NextResponse.json({ error: 'already_redeemed' }, { status: 400 })

    const hdrs = await headers()
    const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const ua = hdrs.get('user-agent') ?? null

    // record redemption
    const { error: insErr } = await svc.from('invite_redemptions').insert({
        invite_id: invite.id, user_id: user.id, ip, user_agent: ua
    })
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })

    // decrement
    const { error: decErr } = await svc.rpc('decrement_uses', { p_code_id: invite.id }).select()
    if (decErr) return NextResponse.json({ error: decErr.message }, { status: 400 })

    // OPTIONAL: elevate role in your app metadata here (kept minimal)

    return NextResponse.json({ ok: true, role: invite.role })
}