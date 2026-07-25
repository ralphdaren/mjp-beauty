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

export interface CatalogVariation {
  name: string
  priceCents: number | null
  durationMs: number | null
  bookable: boolean
}

// Flattens the appointment services into a plain list of variations for the
// public /api/services route. Only name, price, duration and bookability are
// exposed — Square's own item descriptions and image_ids are deliberately never
// read, since the site uses its own copy and Cloudinary photos.
export function listServiceVariations(items: any[]): CatalogVariation[] {
  const variations: CatalogVariation[] = []
  for (const item of items) {
    const data = item.item_data
    if (!data || data.product_type !== 'APPOINTMENTS_SERVICE' || data.is_archived) continue
    for (const v of data.variations ?? []) {
      const name: string | undefined = v.item_variation_data?.name
      if (!name) continue
      variations.push({
        name,
        priceCents: v.item_variation_data?.price_money?.amount ?? null,
        durationMs: v.item_variation_data?.service_duration ?? null,
        bookable: v.item_variation_data?.available_for_booking === true,
      })
    }
  }
  return variations
}

export interface VariationMatch {
  id: string
  version: number
  durationMs: number | null
}

// Find a catalog variation by name (case-insensitive exact match).
// Returns the variation id + version, or null when Square has no such name.
export function findVariationByLabel(items: any[], tierLabel: string): VariationMatch | null {
  const needle = tierLabel.toLowerCase().trim()
  for (const item of items) {
    for (const v of item.item_data?.variations ?? []) {
      const name: string = v.item_variation_data?.name ?? ''
      if (name.toLowerCase().trim() === needle) {
        return {
          id: v.id as string,
          version: v.version as number,
          durationMs: (v.item_variation_data?.service_duration as number | undefined) ?? null,
        }
      }
    }
  }
  return null
}

/**
 * Resolves every service in a multi-service appointment, in booking order.
 * Throws on the first label Square doesn't know, so callers can 404 with it.
 */
export function findVariationsByLabels(items: any[], tierLabels: string[]): VariationMatch[] {
  return tierLabels.map((label) => {
    const match = findVariationByLabel(items, label)
    if (!match) throw new Error(`No Square variation found matching: "${label}"`)
    return match
  })
}

/** Minutes a service runs for, 0 when Square has no duration on the variation. */
export function variationMinutes(match: VariationMatch): number {
  return match.durationMs != null ? Math.round(match.durationMs / 60000) : 0
}
