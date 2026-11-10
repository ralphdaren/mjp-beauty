import { useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/AuthProvider'
import { destinationFor, safeNext } from '@/lib/auth/redirects'
import GoogleButton from '@/components/auth/GoogleButton'
import { FullPageSpinner } from '@/components/auth/RequireAuth'
import AuthLayout, { Divider, Field, FormMessage, SubmitButton, withNext } from './AuthLayout'

const MIN_PASSWORD = 8

export default function SignupPage() {
  const [params] = useSearchParams()
  const next = params.get('next')
  const { session, profile, loading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <FullPageSpinner />
  if (session) return <Navigate to={destinationFor(profile?.role ?? null, next)} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!fullName.trim() || !email.trim()) return setError('Please enter your name and email.')
    if (password.length < MIN_PASSWORD) return setError(`Your password needs at least ${MIN_PASSWORD} characters.`)
    setSubmitting(true)
    const safe = safeNext(next)
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback${safe ? `?next=${encodeURIComponent(safe)}` : ''}`,
      },
    })
    setSubmitting(false)
    if (err) return setError("We couldn't create your account. Please check your details and try again.")
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <FormMessage tone="success">
          We sent a link to {email.trim()}. Click it to confirm your account, then you're all set.
        </FormMessage>
        <Link to={withNext('/login', next)} className="text-sm font-medium text-[#3d3530] hover:underline">
          Back to log in
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create your account" subtitle="Access your courses and bookings in one place.">
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <GoogleButton next={next} />
      <Divider />
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Full name" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SubmitButton loading={submitting}>Create account</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-brand">
        Already have an account?{' '}
        <Link to={withNext('/login', next)} className="font-medium text-[#3d3530] hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
