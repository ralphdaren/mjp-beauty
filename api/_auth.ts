import type { VercelRequest } from '@vercel/node'
import { supabase } from './_supabase.js'
import { isAdminRole, parseBearer } from './_auth-core.js'

/**
 * Returns the signed-in admin for this request, or null.
 * Token = Supabase access token from `Authorization: Bearer`; role comes from `profiles`.
 */
export async function getAdminUser(req: VercelRequest): Promise<{ id: string; email: string | null } | null> {
  const token = parseBearer(req.headers.authorization)
  if (!token) return null
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) return null
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()
    if (profileError || !isAdminRole(profile?.role)) return null
    return { id: data.user.id, email: data.user.email ?? null }
  } catch {
    return null
  }
}
