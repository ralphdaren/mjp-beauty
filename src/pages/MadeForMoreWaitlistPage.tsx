import { useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import MadeForMoreNavbar from '@/components/MadeForMoreNavbar'
import { MFM_WAITLIST, MFM_WAITLIST_SOURCE } from '@/data/madeForMore'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function MadeForMoreWaitlistPage() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return

    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed) || trimmed.length > 254) {
      setError('Please enter a valid email address.')
      emailRef.current?.focus()
      return
    }

    setBusy(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: MFM_WAITLIST_SOURCE, honeypot }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error ?? 'Something went wrong. Please try again.')
        setBusy(false)
        return
      }

      setJoined(true)
    } catch {
      setError('Could not reach us just now. Please check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <main className="mfm-tickets-page">
      <MadeForMoreNavbar />

      <section className="mfm-waitlist">
        <header className="mfm-tickets-head">
          <p className="font-sans mfm-eyebrow">{MFM_WAITLIST.eyebrow}</p>
          <h1 className="hero-heading font-sans mfm-waitlist-title">
            {MFM_WAITLIST.headingLead} <em>{MFM_WAITLIST.headingAccent}</em>
          </h1>
        </header>

        {joined ? (
          <div className="mfm-waitlist-done" role="status">
            <span className="mfm-waitlist-done-icon" aria-hidden="true">
              <Check />
            </span>
            <h2 className="about-subheading mfm-waitlist-done-heading">
              {MFM_WAITLIST.successHeading}
            </h2>
            <p className="font-sans mfm-waitlist-body">{MFM_WAITLIST.successBody}</p>
          </div>
        ) : (
          <>
            <p className="font-sans mfm-waitlist-body">{MFM_WAITLIST.body}</p>

            <form className="mfm-waitlist-form" onSubmit={handleSubmit} noValidate>
              <label className="mfm-ticket-field">
                <span className="font-sans mfm-ticket-field-label">
                  {MFM_WAITLIST.fieldLabel}
                </span>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={MFM_WAITLIST.placeholder}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'mfm-waitlist-error' : 'mfm-waitlist-hint'}
                  className={`font-sans mfm-ticket-input${
                    error ? ' mfm-ticket-input--invalid' : ''
                  }`}
                />
                {error ? (
                  <span
                    id="mfm-waitlist-error"
                    role="alert"
                    className="font-sans mfm-ticket-field-error"
                  >
                    {error}
                  </span>
                ) : (
                  <span id="mfm-waitlist-hint" className="font-sans mfm-ticket-field-hint">
                    {MFM_WAITLIST.hint}
                  </span>
                )}
              </label>

              {/* Honeypot — hidden from people, catnip for bots. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="mfm-waitlist-trap"
              />

              <button type="submit" disabled={busy} className="font-sans mfm-ticket-btn">
                {busy && <Loader2 className="mfm-ticket-spinner" aria-hidden="true" />}
                {busy ? MFM_WAITLIST.submitting : MFM_WAITLIST.submit}
              </button>
            </form>
          </>
        )}

        <p className="font-sans mfm-tickets-foot">{MFM_WAITLIST.foot}</p>
      </section>
    </main>
  )
}
