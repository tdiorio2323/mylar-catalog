'use client'
import { useEffect, useState } from 'react'

export default function InvitePage() {
  const [invites, setInvites] = useState<any[]>([])
  const [form, setForm] = useState({ email:'', role:'creator', uses:5, days:30, note:'', code:'' })
  const [loading, setLoading] = useState(false)
  
  const loadInvites = async () => {
    const r = await fetch('/api/invites/list', { method:'POST' }).catch(()=>null)
    if (r?.ok) setInvites((await r.json()).invites || [])
  }

  useEffect(() => { loadInvites() }, [])

  const create = async () => {
    setLoading(true)
    const r = await fetch('/api/invites/create', {
      method:'POST',
      headers:{ 'content-type':'application/json' },
      body: JSON.stringify(form)
    })
    setLoading(false)
    if (r.ok) { setForm({ email:'', role:'creator', uses:5, days:30, note:'', code:'' }); loadInvites() }
    else alert('Create failed')
  }

  const revoke = async (id:string) => {
    if (!confirm('Revoke this invite?')) return
    const r = await fetch('/api/invites/revoke', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id }) })
    if (r.ok) loadInvites()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Invitations</h1>
      <div className="p-4 rounded-2xl border bg-white/5 backdrop-blur">
        <div className="grid grid-cols-2 gap-3">
          <input className="px-3 py-2 rounded border bg-transparent" placeholder="Target email (optional)"
                 value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))}/>
          <input className="px-3 py-2 rounded border bg-transparent" placeholder="Custom code (optional)"
                 value={form.code} onChange={e=>setForm(v=>({...v,code:e.target.value}))}/>
          <select className="px-3 py-2 rounded border bg-transparent" value={form.role}
                  onChange={e=>setForm(v=>({...v,role:e.target.value}))}>
            <option value="creator">creator</option>
            <option value="client">client</option>
            <option value="admin">admin</option>
          </select>
          <input className="px-3 py-2 rounded border bg-transparent" type="number" min={1}
                 value={form.uses} onChange={e=>setForm(v=>({...v,uses:+e.target.value||1}))}/>
          <input className="px-3 py-2 rounded border bg-transparent col-span-2" type="number" min={1}
                 value={form.days} onChange={e=>setForm(v=>({...v,days:+e.target.value||30}))}/>
          <input className="px-3 py-2 rounded border bg-transparent col-span-2" placeholder="Note"
                 value={form.note} onChange={e=>setForm(v=>({...v,note:e.target.value}))}/>
        </div>
        <button onClick={create} disabled={loading} className="mt-3 px-4 py-2 rounded-xl border">
          {loading ? 'Creating…' : 'Create Invite'}
        </button>
      </div>

      <div className="space-y-3">
        {invites.map((i)=>(
          <div key={i.id} className="p-3 rounded-xl border flex items-center justify-between">
            <div>
              <div className="font-mono text-sm">{i.code}</div>
              <div className="text-xs opacity-70">{i.role} • uses {i.uses_remaining}/{i.uses_allowed} • exp {new Date(i.expires_at).toLocaleString()}</div>
            </div>
            <button onClick={()=>revoke(i.id)} className="px-3 py-1 rounded-lg border">Revoke</button>
          </div>
        ))}
      </div>
    </div>
  )
}