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
  id: string
  name: string
  priceCents: number | null
  durationMs: number | null
  bookable: boolean
}

/** One bookable service, with the options Square sells it under. */
export interface CatalogItem {
  id: string
  name: string
  variations: CatalogVariation[]
}

// Groups the appointment services for the public /api/services route, keeping
// each option under the item that owns it so the site can show Square's own
// service name. Only ids, names, price, duration and bookability are exposed —
// Square's item descriptions and image_ids are deliberately never read, since
// the site uses its own copy and Cloudinary photos.
export function listServiceItems(items: any[]): CatalogItem[] {
  const services: CatalogItem[] = []
  for (const item of items) {
    const data = item.item_data
    if (!data || data.product_type !== 'APPOINTMENTS_SERVICE' || data.is_archived) continue
    const variations: CatalogVariation[] = []
    for (const v of data.variations ?? []) {
      const name: string | undefined = v.item_variation_data?.name
      if (!name || !v.id) continue
      variations.push({
        id: v.id as string,
        name,
        priceCents: v.item_variation_data?.price_money?.amount ?? null,
        durationMs: v.item_variation_data?.service_duration ?? null,
        bookable: v.item_variation_data?.available_for_booking === true,
      })
    }
    if (variations.length > 0) {
      services.push({ id: item.id as string, name: (data.name as string | undefined) ?? '', variations })
    }
  }
  return services
}

/** Flat variation list — the pre-ID response shape, kept for cached clients. */
export function listServiceVariations(items: any[]): CatalogVariation[] {
  return listServiceItems(items).flatMap((item) => item.variations)
}

export interface VariationMatch {
  id: string
  version: number
  durationMs: number | null
  /** Name of the parent catalog item — the service this option belongs to. */
  itemName: string
  /** Square's own name for this option, whatever the browser called it. */
  variationName: string
}

function toMatch(item: any, v: any): VariationMatch {
  return {
    id: v.id as string,
    version: v.version as number,
    durationMs: (v.item_variation_data?.service_duration as number | undefined) ?? null,
    itemName: (item.item_data?.name as string | undefined) ?? '',
    variationName: (v.item_variation_data?.name as string | undefined) ?? '',
  }
}

/** Find a catalog variation by its Square id — unique, and stable across renames. */
export function findVariationById(items: any[], variationId: string): VariationMatch | null {
  for (const item of items) {
    for (const v of item.item_data?.variations ?? []) {
      if (v.id === variationId) return toMatch(item, v)
    }
  }
  return null
}

// Find a catalog variation by name (case-insensitive exact match).
// Returns the variation id + version, or null when Square has no such name.
//
// Names are only unique because Micah keeps them that way — nothing in Square
// enforces it. Two items sharing an option name (say both offering a "Returning
// Client") is ambiguous, and guessing would book the wrong service at the wrong
// price, so an ambiguous label resolves to nothing and the caller fails visibly.
// Prefer `findVariationById`; this stays for rows stored before ids were sent.
export function findVariationByLabel(items: any[], tierLabel: string): VariationMatch | null {
  const needle = tierLabel.toLowerCase().trim()
  let found: VariationMatch | null = null
  for (const item of items) {
    for (const v of item.item_data?.variations ?? []) {
      const name: string = v.item_variation_data?.name ?? ''
      if (name.toLowerCase().trim() !== needle) continue
      if (found) return null
      found = toMatch(item, v)
    }
  }
  return found
}

/** How the browser (or a stored booking row) points at one service option. */
export interface VariationRef {
  variationId?: string | null
  tierLabel: string
}

// Resolve by id when the caller sent one, falling back to the label. The label
// is still what's shown and stored, so a stale id never blocks a booking.
export function findVariation(items: any[], ref: VariationRef): VariationMatch | null {
  if (ref.variationId) {
    const byId = findVariationById(items, ref.variationId)
    if (byId) return byId
  }
  return findVariationByLabel(items, ref.tierLabel)
}

/**
 * Resolves every service in a multi-service appointment, in booking order.
 * Throws on the first ref Square doesn't know, so callers can 404 with it.
 */
export function findVariations(items: any[], refs: VariationRef[]): VariationMatch[] {
  return refs.map((ref) => {
    const match = findVariation(items, ref)
    if (!match) throw new Error(`No Square variation found matching: "${ref.tierLabel}"`)
    return match
  })
}

/** Minutes a service runs for, 0 when Square has no duration on the variation. */
export function variationMinutes(match: VariationMatch): number {
  return match.durationMs != null ? Math.round(match.durationMs / 60000) : 0
}
