import { useState } from 'react'

interface AdminLoginProps {
  onSubmit: (password: string) => Promise<string | null>
}

export default function AdminLogin({ onSubmit }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      setError((await onSubmit(password)) ?? '')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f2ec] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-center text-xs tracking-[0.2em] uppercase text-[#a0948a] mb-1">MJP Beauty</p>
        <h1 className="text-center text-xl font-semibold text-[#3d3530] mb-8">Admin</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#e3e2de] rounded-xl px-4 py-3 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530] transition-colors"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-50 hover:enabled:bg-[#2a2320] transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
