import type { CSSProperties } from 'react'
import type { BookingSourceKey, ServiceColorKey } from './calendarTypes'

interface ServiceStyle {
  label: string
  style: CSSProperties
}

const STUDENT_STRIPES = 'repeating-linear-gradient(45deg, #f1ede8, #f1ede8 4px, #e8e2da 4px, #e8e2da 8px)'

export const SERVICE_STYLE: Record<ServiceColorKey, ServiceStyle> = {
  lamination: { label: 'Lamination', style: { background: '#e9d5c3', borderColor: '#b07d4e' } },
  wax: { label: 'Shape & Wax', style: { background: '#dfe6dc', borderColor: '#6f8a68' } },
  tint: { label: 'Shape & Tint', style: { background: '#e6dcea', borderColor: '#8a6f99' } },
  lash: { label: 'Lash Lift', style: { background: '#dbe4ec', borderColor: '#5f7f99' } },
  henna: { label: 'Henna', style: { background: '#efdcd6', borderColor: '#a8604c' } },
  student: { label: 'Student Model', style: { background: STUDENT_STRIPES, borderColor: '#a0948a', color: '#6b5f58' } },
  other: { label: 'Other', style: { background: '#ece7e0', borderColor: '#a0948a' } },
}

/** Small swatch (legend, month dots, panel bullets): fill plus a ring in the service's accent. */
export function swatchStyle(key: ServiceColorKey): CSSProperties {
  const { background, borderColor } = SERVICE_STYLE[key].style
  return { background, boxShadow: `inset 0 0 0 1.5px ${borderColor}` }
}

export const LEGEND_KEYS: ServiceColorKey[] = ['lamination', 'wax', 'tint', 'lash', 'henna', 'student']

export const SOURCE_LABEL: Record<BookingSourceKey, string> = {
  website: 'Booked through website',
  square: 'Created in Square',
  'square-booking-page': 'Square booking page',
  'google-instagram': 'Google / Instagram',
  other: 'Other',
}

/** Square names are ALL-CAPS for now; show them in title case. */
export function displayServiceName(name: string): string {
  if (name !== name.toUpperCase()) return name
  return name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function formatMinuteOfDay(minute: number): string {
  const h = Math.floor(minute / 60)
  const m = minute % 60
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}
