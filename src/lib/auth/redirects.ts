// Pure redirect rules for login. No imports, so node:test can load it directly.

export type Role = 'student' | 'admin'

/** Returns `next` only when it is a same-site path; anything that could leave the site gives null. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || next[0] !== '/') return null
  if (next[1] === '/' || next[1] === '\\') return null
  return next
}

/** Where a user goes after logging in: a safe `next` wins, otherwise admins to /admin, everyone else to /portal. */
export function destinationFor(role: Role | null, next?: string | null): string {
  return safeNext(next) ?? (role === 'admin' ? '/admin' : '/portal')
}
