import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { safeNext } from '@/lib/auth/redirects'

export default function GoogleButton({ next }: { next?: string | null }) {
  const [error, setError] = useState('')

  async function handleClick() {
    setError('')
    const safe = safeNext(next)
    const redirectTo = `${window.location.origin}/auth/callback${safe ? `?next=${encodeURIComponent(safe)}` : ''}`
    const { error: err } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    if (err) setError("We couldn't connect to Google. Please try again.")
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 rounded-md border border-brand-border bg-white py-2.5 text-sm font-medium text-[#3d3530] hover:bg-brand-light transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 11.9S6.7 21.5 12 21.5c6.9 0 9.2-4.9 9.2-7.4 0-.5-.1-.9-.1-1.3H12z" />
        </svg>
        Continue with Google
      </button>
      {error && <p className="mt-2 text-sm text-red-700" role="alert">{error}</p>}
    </>
  )
}
