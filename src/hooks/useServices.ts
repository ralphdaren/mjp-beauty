import { useEffect, useState } from 'react'
import type { Service } from '../types/booking'
import { SERVICES } from '../data/booking'
import { mergeCatalog, type CatalogItem } from '../lib/catalog'

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
