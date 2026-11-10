import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/AuthProvider'
import { Field, FormMessage, SubmitButton } from '../auth/AuthLayout'

const MIN_PASSWORD = 8

function NameForm() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.full_name ?? '')
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!name.trim()) return setMsg({ tone: 'error', text: 'Please enter your name.' })
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user.id)
    setSaving(false)
    if (error) return setMsg({ tone: 'error', text: "We couldn't save your name. Please try again." })
    await refreshProfile()
    setMsg({ tone: 'success', text: 'Saved' })
  }

  return (
    <form onSubmit={save} noValidate>
      {msg && <FormMessage tone={msg.tone}>{msg.text}</FormMessage>}
      <Field label="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      <SubmitButton loading={saving}>Save name</SubmitButton>
    </form>
  )
}

function PasswordForm() {
  const { user } = useAuth()
  const hasPassword = user?.identities?.some((i) => i.provider === 'email') ?? false
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function save(e: FormEvent) {
    e.preventDefault()
    if (password.length < MIN_PASSWORD) return setMsg({ tone: 'error', text: `Your password needs at least ${MIN_PASSWORD} characters.` })
    if (password !== confirm) return setMsg({ tone: 'error', text: "Those passwords don't match." })
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) return setMsg({ tone: 'error', text: "We couldn't update your password. Please try again." })
    setPassword('')
    setConfirm('')
    setMsg({ tone: 'success', text: 'Password updated' })
  }

  return (
    <form onSubmit={save} noValidate>
      <h2 className="text-base font-semibold mb-1">{hasPassword ? 'Change password' : 'Add a password'}</h2>
      {!hasPassword && (
        <p className="mb-4 text-sm text-brand">You sign in with Google. Add a password if you'd also like to log in with your email.</p>
      )}
      {msg && <FormMessage tone={msg.tone}>{msg.text}</FormMessage>}
      <Field label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Field label="Confirm new password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <SubmitButton loading={saving}>{hasPassword ? 'Change password' : 'Add password'}</SubmitButton>
    </form>
  )
}

export default function AccountPage() {
  const { user, signOut } = useAuth()
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold">Account</h1>
      <section className="mt-6 rounded-xl border border-brand-border bg-white p-5">
        <p className="text-sm font-medium mb-1.5">Email</p>
        <p className="text-sm text-brand mb-5">{user?.email}</p>
        <NameForm />
      </section>
      <section className="mt-6 rounded-xl border border-brand-border bg-white p-5">
        <PasswordForm />
      </section>
      <button
        type="button"
        onClick={() => void signOut()}
        className="mt-6 w-full rounded-md border border-[#3d3530] py-2.5 text-sm font-semibold hover:bg-white"
      >
        Log out
      </button>
    </div>
  )
}
