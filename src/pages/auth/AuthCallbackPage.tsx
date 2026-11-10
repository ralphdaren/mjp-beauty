import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthProvider'
import { destinationFor } from '@/lib/auth/redirects'
import { FullPageSpinner } from '@/components/auth/RequireAuth'
import AuthLayout, { FormMessage } from './AuthLayout'

// Landing spot for email confirmation and Google sign-in. supabase-js exchanges the
// ?code= in the URL for a session on its own; we wait for it, then route the user.
export default function AuthCallbackPage() {
  const [params] = useSearchParams()
  const { session, profile, loading } = useAuth()
  const [timedOut, setTimedOut] = useState(false)
  const providerError = params.get('error_description')

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 8000)
    return () => window.clearTimeout(t)
  }, [])

  if (session && !loading) return <Navigate to={destinationFor(profile?.role ?? null, params.get('next'))} replace />

  if (providerError || (timedOut && !session)) {
    return (
      <AuthLayout title="Something went wrong">
        <FormMessage tone="error">We couldn't sign you in with that link. It may have expired.</FormMessage>
        <Link to="/login" className="text-sm font-medium text-[#3d3530] hover:underline">
          Back to log in
        </Link>
      </AuthLayout>
    )
  }

  return <FullPageSpinner />
}
