import { useCallback, useEffect, useState } from 'react'

// Mirrors FeeQuote in api/_fee-charge.ts (redeclared on purpose, no cross-import from api/).
export type FeeReason = 'late' | 'same_day' | 'no_show' | 'late_arrival'

export interface FeeQuote {
  requestId: string
  chargeable: boolean
  services: Array<{ serviceName: string; tierLabel: string; priceCents: number | null }>
  totalCents: number | null
  options: Array<{ reason: FeeReason; label: string; detail: string; pct: number; amountCents: number | null }>
  card: { brand: string; last4: string } | null
  cardError: string | null
  email: string
  firstName: string
  lastName: string
  startAt: string
}

export interface FeePreview {
  chargeCents: number
  gstCents: number
}

export interface FeeChargeResult {
  chargedCents: number
  paymentId: string
  emailSent: boolean
}

export class FeeRequestError extends Error {
  status: number
  /** Server kept the booking locked because the outcome is unknown: do not offer a retry. */
  keepsClaim: boolean
  alreadyCharged: boolean
  constructor(message: string, status: number, flags: { keepsClaim?: boolean; alreadyCharged?: boolean } = {}) {
    super(message)
    this.status = status
    this.keepsClaim = !!flags.keepsClaim
    this.alreadyCharged = !!flags.alreadyCharged
  }
}

/** `unknownOnFailure`: only the charge call, where a dropped connection leaves the outcome unknown. */
async function feeFetch<T>(token: string, url: string, init?: RequestInit, unknownOnFailure = false): Promise<T> {
  const unknown = () =>
    new FeeRequestError('Lost connection to the server. Check this client in Square before trying again.', 0, {
      keepsClaim: true,
    })
  let res: Response
  try {
    res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
  } catch {
    if (unknownOnFailure) throw unknown()
    throw new FeeRequestError('Could not reach the server. Nothing was charged. Check your connection and try again.', 0)
  }
  let data: { error?: string; keepClaim?: boolean; alreadyCharged?: boolean } = {}
  try {
    data = await res.json()
  } catch {
    if (unknownOnFailure) throw unknown()
  }
  if (!res.ok) {
    throw new FeeRequestError(data.error ?? `Request failed (${res.status}).`, res.status, {
      keepsClaim: data.keepClaim,
      alreadyCharged: data.alreadyCharged,
    })
  }
  return data as T
}

export function useFeeCharge(requestId: string, token: string) {
  const [quote, setQuote] = useState<FeeQuote | null>(null)
  const [quoteError, setQuoteError] = useState('')

  useEffect(() => {
    let cancelled = false
    feeFetch<FeeQuote>(token, `/api/admin?resource=fee-quote&requestId=${encodeURIComponent(requestId)}`)
      .then((q) => {
        if (!cancelled) setQuote(q)
      })
      .catch((err) => {
        if (!cancelled) setQuoteError(err instanceof Error ? err.message : 'Could not load the fee details.')
      })
    return () => {
      cancelled = true
    }
  }, [requestId, token])

  const preview = useCallback(
    (amountCents: number) =>
      feeFetch<FeePreview>(token, '/api/admin', {
        method: 'POST',
        body: JSON.stringify({ resource: 'fee', action: 'preview', requestId, amountCents }),
      }),
    [requestId, token],
  )

  const charge = useCallback(
    (reason: FeeReason, amountCents: number) =>
      feeFetch<FeeChargeResult>(token, '/api/admin', {
        method: 'POST',
        body: JSON.stringify({ resource: 'fee', action: 'charge', requestId, reason, amountCents }),
      }, true),
    [requestId, token],
  )

  return { quote, quoteError, preview, charge }
}
