// Pure helpers for admin auth. No imports, so node:test can load it without Supabase env.

export function parseBearer(header: string | string[] | undefined): string | null {
  if (typeof header !== 'string') return null
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim())
  return match ? match[1] : null
}

export function isAdminRole(role: unknown): boolean {
  return role === 'admin'
}
