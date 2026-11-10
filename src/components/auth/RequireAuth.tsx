import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthProvider'
import type { Role } from '@/lib/auth/redirects'

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light" role="status" aria-label="Loading">
      <div className="h-8 w-8 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
    </div>
  )
}

export default function RequireAuth({ role, children }: { role?: Role; children: ReactNode }) {
  const { session, profile, loading } = useAuth()
  const { pathname, search } = useLocation()

  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to={`/login?next=${encodeURIComponent(pathname + search)}`} replace />
  if (role === 'admin' && profile?.role !== 'admin') return <Navigate to="/portal" replace />
  return <>{children}</>
}
