import { useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/AuthProvider'
import { destinationFor } from '@/lib/auth/redirects'
import GoogleButton from '@/components/auth/GoogleButton'
import { FullPageSpinner } from '@/components/auth/RequireAuth'
import AuthLayout, { Divider, Field, FormMessage, SubmitButton, withNext } from './AuthLayout'

export default function LoginPage() {
  const [params] = useSearchParams()
  const next = params.get('next')
  const { session, profile, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Signed in (already, or just now): AuthProvider loads the profile, then we leave.
  if (loading && !submitting) return <FullPageSpinner />
  if (session && !loading) return <Navigate to={destinationFor(profile?.role ?? null, next)} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (err) {
      setSubmitting(false)
      setError(
        err.code === 'email_not_confirmed'
          ? 'Please confirm your email first. Check your inbox for the link.'
          : "That email and password don't match.",
      )
    }
  }

  return (
    <AuthLayout title="Log in" subtitle="Welcome back to MJP Beauty.">
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <GoogleButton next={next} />
      <Divider />
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="-mt-2 mb-4 text-right">
          <Link to="/forgot-password" className="text-xs text-brand hover:underline">
            Forgot your password?
          </Link>
        </div>
        <SubmitButton loading={submitting}>Log in</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-brand">
        New here?{' '}
        <Link to={withNext('/signup', next)} className="font-medium text-[#3d3530] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
