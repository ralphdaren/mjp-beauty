import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/AuthProvider'
import { destinationFor } from '@/lib/auth/redirects'
import { FullPageSpinner } from '@/components/auth/RequireAuth'
import AuthLayout, { Field, FormMessage, SubmitButton } from './AuthLayout'

const MIN_PASSWORD = 8

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { session, profile, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <FullPageSpinner />
  if (!session) {
    return (
      <AuthLayout title="Link expired">
        <FormMessage tone="error">This reset link has expired or was already used.</FormMessage>
        <Link to="/forgot-password" className="text-sm font-medium text-[#3d3530] hover:underline">
          Send a new link
        </Link>
      </AuthLayout>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < MIN_PASSWORD) return setError(`Your password needs at least ${MIN_PASSWORD} characters.`)
    setSubmitting(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (err) return setError("We couldn't update your password. Please try again.")
    navigate(destinationFor(profile?.role ?? null), { replace: true })
  }

  return (
    <AuthLayout title="Choose a new password">
      {error && <FormMessage tone="error">{error}</FormMessage>}
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SubmitButton loading={submitting}>Save password</SubmitButton>
      </form>
    </AuthLayout>
  )
}
