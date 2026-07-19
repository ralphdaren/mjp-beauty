import { SERVICES } from './booking'

export type SearchEntry = {
  title: string
  description: string
  /** Extra words people might type that don't appear in the title or description. */
  keywords: string
  to: string
  group: 'Pages' | 'Services' | 'Courses'
}

/**
 * Hand-maintained entries for the site's fixed pages. Products are NOT listed
 * here — they're queried live from Shopify so new products are searchable the
 * moment they're published. Only add to this list when a new *page* ships.
 */
const PAGE_ENTRIES: SearchEntry[] = [
  {
    title: 'Home',
    description: 'MJP Beauty — brow artistry and education in Winnipeg.',
    keywords: 'homepage start main mjp beauty',
    to: '/',
    group: 'Pages',
  },
  {
    title: 'Book an Appointment',
    description: 'Browse services, pick a time, and reserve your spot.',
    keywords: 'booking appointment schedule reserve calendar availability',
    to: '/book-appointment',
    group: 'Pages',
  },
  {
    title: 'In-Person Academy',
    description: 'Hands-on brow training in studio, with dates and deposits.',
    keywords: 'in person training class course certification workshop student',
    to: '/in-person-training',
    group: 'Pages',
  },
  {
    title: 'Online Brow Academy',
    description: 'The all-in-one online course covering technique and business.',
    keywords: 'online academy all in one course digital learn',
    to: '/online-brow-courses',
    group: 'Pages',
  },
  {
    title: 'Single Courses',
    description: 'Browse individual online modules and buy them one at a time.',
    keywords: 'modules single courses shop products buy catalogue',
    to: '/online-modules',
    group: 'Pages',
  },
  {
    title: 'Freebies',
    description: 'Free guides, resources, and downloads.',
    keywords: 'free freebie download guide resource giveaway',
    to: '/freebies',
    group: 'Pages',
  },
  {
    title: 'BIZ Mentorship',
    description: 'One-on-one business mentorship for beauty professionals.',
    keywords: 'business mentorship coaching mentor biz one on one',
    to: '/biz-mentorship',
    group: 'Pages',
  },
  {
    title: 'Manage My Booking',
    description: 'Reschedule or cancel an existing appointment.',
    keywords: 'manage reschedule cancel change existing booking appointment',
    to: '/manage-booking',
    group: 'Pages',
  },
  {
    title: 'Privacy Policy',
    description: 'How we handle your personal information.',
    keywords: 'privacy policy data personal information legal',
    to: '/privacy',
    group: 'Pages',
  },
  {
    title: 'Terms of Use',
    description: 'The terms governing use of this site and our services.',
    keywords: 'terms conditions use legal agreement',
    to: '/terms',
    group: 'Pages',
  },
]

/** Derived from SERVICES so adding a service to booking.ts makes it searchable. */
const SERVICE_ENTRIES: SearchEntry[] = SERVICES.map((service) => ({
  title: service.name,
  description: service.tagline,
  keywords: `${service.description} ${service.tiers.map((t) => t.label).join(' ')}`,
  to: `/book-appointment#${service.id}`,
  group: 'Services',
}))

export const SEARCH_INDEX: SearchEntry[] = [...PAGE_ENTRIES, ...SERVICE_ENTRIES]

/**
 * Scores an entry against a query. Every whitespace-separated term must match
 * somewhere, so "brow wax" narrows rather than widens. Matches in the title
 * outrank the description, which outranks the keyword bag.
 */
export function searchStaticEntries(query: string): SearchEntry[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  if (!terms.length) return []

  const scored = SEARCH_INDEX.map((entry) => {
    const title = entry.title.toLowerCase()
    const description = entry.description.toLowerCase()
    const keywords = entry.keywords.toLowerCase()

    let score = 0
    for (const term of terms) {
      if (title.startsWith(term)) score += 10
      else if (title.includes(term)) score += 6
      else if (description.includes(term)) score += 3
      else if (keywords.includes(term)) score += 1
      else return { entry, score: 0 }
    }
    return { entry, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.entry)
}
