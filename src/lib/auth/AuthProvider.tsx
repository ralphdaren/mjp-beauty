import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Role } from './redirects'

export interface Profile {
  id: string
  full_name: string | null
  role: Role
}

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  /** True until the session and (when signed in) the profile have both been resolved. */
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function fetchProfile(id: string) {
  return supabase.from('profiles').select('id, full_name, role').eq('id', id).maybeSingle()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileFor, setProfileFor] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setSessionReady(true)
    })
    // Keep this callback synchronous: calling Supabase inside it can deadlock the auth client.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setSessionReady(true)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user.id ?? null

  const loadProfile = useCallback(async (id: string) => {
    const { data } = await fetchProfile(id)
    setProfile((data as Profile | null) ?? null)
    setProfileFor(id)
  }, [])

  // A stale profile from a previous user is hidden by the profileFor check below.
  useEffect(() => {
    if (!userId) return
    let active = true
    fetchProfile(userId).then(({ data }) => {
      if (!active) return
      setProfile((data as Profile | null) ?? null)
      setProfileFor(userId)
    })
    return () => {
      active = false
    }
  }, [userId])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const refreshProfile = useCallback(async () => {
    if (userId) await loadProfile(userId)
  }, [userId, loadProfile])

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      profile: profileFor === userId ? profile : null,
      loading: !sessionReady || (userId !== null && profileFor !== userId),
      signOut,
      refreshProfile,
    }),
    [session, profile, profileFor, userId, sessionReady, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
