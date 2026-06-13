// Shared Square API client — used by all api/bookings/* routes.
// Files prefixed with _ are not treated as API routes by Vercel.

export const SQUARE_BASE_URL =
  process.env.SQUARE_ENVIRONMENT === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com'

export async function squareFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${SQUARE_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2024-01-18',
      ...(options.headers as Record<string, string> | undefined),
    },
  })
  const data = await res.json()
  if (!res.ok) {
    const detail = (data.errors as Array<{ detail?: string }> | undefined)?.[0]?.detail
    throw new Error(detail ?? JSON.stringify(data))
  }
  return data
}

// Cached location ID — warm serverless instances reuse this across requests
let _locationId: string | null = null

export async function getLocationId(): Promise<string> {
  if (_locationId) return _locationId
  const data = await squareFetch('/v2/locations')
  const id = (data.locations as Array<{ id: string }> | undefined)?.[0]?.id
  if (!id) throw new Error('No Square location found')
  _locationId = id
  return id
}

// Cached catalog items (5-minute TTL)
let _catalogCache: { objects: any[]; fetchedAt: number } | null = null

export async function getCatalogItems(): Promise<any[]> {
  const now = Date.now()
  if (_catalogCache && now - _catalogCache.fetchedAt < 5 * 60 * 1000) {
    return _catalogCache.objects
  }
  const data = await squareFetch('/v2/catalog/list?types=ITEM')
  const objects: any[] = data.objects ?? []
  _catalogCache = { objects, fetchedAt: now }
  return objects
}

// Find a catalog variation by name (case-insensitive exact match).
// Returns the variation id + version, or null with a list of available names for debugging.
export function findVariationByLabel(
  items: any[],
  tierLabel: string,
): { id: string; version: number } | { id: null; availableNames: string[] } {
  const needle = tierLabel.toLowerCase().trim()
  for (const item of items) {
    for (const v of item.item_data?.variations ?? []) {
      const name: string = v.item_variation_data?.name ?? ''
      if (name.toLowerCase().trim() === needle) {
        return { id: v.id as string, version: v.version as number }
      }
    }
  }
  const availableNames: string[] = []
  for (const item of items) {
    for (const v of item.item_data?.variations ?? []) {
      availableNames.push(`${item.item_data?.name} — ${v.item_variation_data?.name}`)
    }
  }
  return { id: null, availableNames }
}
