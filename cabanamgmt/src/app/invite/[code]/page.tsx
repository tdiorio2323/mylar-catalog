'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AcceptInvite({ params }: { params: { code: string } }) {
    const router = useRouter()
    const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const redeem = async () => {
        const r = await fetch('/api/invites/accept', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ code: params.code })
        })
        if (r.ok) {
            setStatus('ok'); setMessage('Invite accepted! Redirecting…')
            setTimeout(() => router.push('/dashboard'), 1000)
        } else {
            const j = await r.json().catch(() => ({}))
            setStatus('error'); setMessage(j.error || 'Failed to redeem')
        }
    }

    useEffect(() => { redeem() }, [redeem])

    return (
        <div className="min-h-screen grid place-items-center">
            <div className="p-6 rounded-2xl border bg-white/5 backdrop-blur">
                <div className="text-lg">{status === 'idle' ? 'Redeeming…' : message}</div>
                {status === 'error' && <button className="mt-3 px-4 py-2 rounded-xl border" onClick={() => router.push('/login')}>Sign in & retry</button>}
            </div>
        </div>
    )
}