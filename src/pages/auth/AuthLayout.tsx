import type { InputHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import logoBrown from '@/assets/brand-kit/logo-brown.png'

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-8">
        <img src={logoBrown} alt="MJP Beauty" className="h-14 w-auto" />
      </Link>
      <div className="w-full max-w-sm bg-white border border-brand-border rounded-xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-[#3d3530]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-brand">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, ...input }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-[#3d3530] mb-1.5">{label}</span>
      <input
        {...input}
        className="w-full rounded-md border border-brand-border px-3 py-2.5 text-sm text-[#3d3530] outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  )
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-md bg-[#3d3530] text-white text-sm font-semibold py-2.5 hover:opacity-90 disabled:opacity-60 transition-opacity"
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}

export function FormMessage({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  const cls = tone === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-800 border-green-200'
  return <p className={`mb-4 rounded-md border px-3 py-2 text-sm ${cls}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</p>
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-brand-muted">
      <span className="h-px flex-1 bg-brand-border" />
      or
      <span className="h-px flex-1 bg-brand-border" />
    </div>
  )
}

/** Keeps `?next=` when moving between the auth pages. */
// eslint-disable-next-line react-refresh/only-export-components
export function withNext(path: string, next: string | null): string {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path
}
