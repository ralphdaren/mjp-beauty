export const TIMEZONE = 'America/Winnipeg'

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatSubmitted(iso: string) {
  return new Date(iso).toLocaleString('en-CA', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
