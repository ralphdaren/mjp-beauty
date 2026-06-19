import { useRef, useState, useEffect } from 'react'

interface UseSquareCardOptions {
  active: boolean
  locationId: string | null
  onSuccess: (sourceId: string) => void
}

export function useSquareCard({ active, locationId, onSuccess }: UseSquareCardOptions) {
  const cardRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active || !locationId) {
      if (cardRef.current) {
        cardRef.current.destroy().catch(() => {})
        cardRef.current = null
      }
      return
    }

    const sq = (window as any).Square
    if (!sq) {
      setError('Payment system failed to load. Please refresh the page.')
      return
    }

    let cancelled = false
    setError(null)

    async function init() {
      try {
        const payments = sq.payments(import.meta.env.VITE_SQUARE_APP_ID, locationId)
        if (cancelled) return
        const card = await payments.card({
          style: {
            '.input-container': { borderColor: '#e3e2de', borderRadius: '8px' },
            '.input-container.is-focus': { borderColor: '#827064' },
            '.input-container.is-error': { borderColor: '#ef4444' },
            input: { color: '#3d3530', fontSize: '14px' },
            'input::placeholder': { color: '#c0b4ac' },
          },
        })
        if (cancelled) { card.destroy(); return }
        await card.attach('#card-container')
        cardRef.current = card
      } catch {
        if (!cancelled) setError('Failed to load card form. Please try again.')
      }
    }

    init()

    return () => {
      cancelled = true
      if (cardRef.current) {
        cardRef.current.destroy().catch(() => {})
        cardRef.current = null
      }
    }
  }, [active, locationId])

  async function tokenize() {
    if (!cardRef.current) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await cardRef.current.tokenize()
      if (result.status === 'OK') {
        onSuccess(result.token as string)
      } else {
        setError(result.errors?.[0]?.message ?? 'Card verification failed. Please check your details.')
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return { error, isLoading, tokenize }
}
