// POST /api/waitlist { email, source?, honeypot? } → { ok: true }
//   Parks an email in public.event_waitlist so Micah can announce future events.
//   Write-only on purpose: nothing in the app or the admin dashboard reads this
//   table, it's a list to export from Supabase when the next event is ready.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from './_supabase.js'
import { enforceRateLimit, waitlistLimiter } from './_ratelimit.js'
import { setCorsHeaders } from './_cors.js'
import { isValidEmail, isNonEmptyString } from './_validate.js'

const DEFAULT_SOURCE = 'made-for-more-calgary'

// Allow-listed so a scripted caller can't spray junk list names into the table.
const ALLOWED_SOURCES: readonly string[] = [DEFAULT_SOURCE]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!(await enforceRateLimit(req, res, waitlistLimiter))) return

  const { email, source, honeypot } = (req.body ?? {}) as Record<string, unknown>

  // Bots fill the hidden field. Let them believe it worked.
  if (honeypot) return res.status(200).json({ ok: true })

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }

  const list = isNonEmptyString(source, 60) ? source : DEFAULT_SOURCE
  if (!ALLOWED_SOURCES.includes(list)) {
    return res.status(400).json({ error: 'Unknown waitlist.' })
  }

  try {
    // Lower-cased going in so the (email, source) unique index actually catches
    // the same person signing up twice; a repeat is a silent no-op, not an error.
    const { error } = await supabase
      .from('event_waitlist')
      .upsert(
        { email: email.trim().toLowerCase(), source: list },
        { onConflict: 'email,source', ignoreDuplicates: true },
      )

    if (error) {
      console.error('waitlist upsert failed', error)
      return res.status(500).json({ error: 'Could not add you to the waitlist. Please try again.' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('waitlist upsert threw', err)
    return res.status(500).json({ error: 'Could not add you to the waitlist. Please try again.' })
  }
}
