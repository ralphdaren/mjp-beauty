import { useEffect, useState } from 'react'
import type { Service } from '../types/booking'
import { SERVICES } from '../data/booking'
import { mergeCatalog, type CatalogItem } from '../lib/catalog'

// Service names, option names, prices and durations come from Square; copy,
// photos and video stay in booking.ts. Starts from the static list so the page
// paints immediately and still works if Square is unreachable — `ready` flips
// either way once the fetch settles, so callers that need the final names and
// pricing can wait for it.
export function useServices(): { services: Service[]; ready: boolean } {
  const [services, setServices] = useState<Service[]>(SERVICES)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/services')
      .then((r) => r.json())
      .then((data: { items?: CatalogItem[] }) => {
        if (cancelled || !data.items?.length) return
        setServices(mergeCatalog(SERVICES, data.items))
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [])

  return { services, ready }
}
