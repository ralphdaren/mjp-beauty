import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AuthLayout, { Field, FormMessage, SubmitButton } from './AuthLayout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    // Same message whether or not the account exists, so emails can't be probed.
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` })
    setSubmitting(false)
    setSent(true)
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <FormMessage tone="success">If that email has an account, we've sent a reset link.</FormMessage>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <SubmitButton loading={submitting}>Send reset link</SubmitButton>
        </form>
      )}
      <Link to="/login" className="mt-6 inline-block text-sm font-medium text-[#3d3530] hover:underline">
        Back to log in
      </Link>
    </AuthLayout>
  )
}
