// Shared IP-based rate limiting for public API routes, backed by Upstash Redis
// so limits are enforced consistently across serverless instances (unlike an
// in-memory counter, which resets per cold start and isn't shared).

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

function makeLimiter(prefix: string, requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${prefix}`,
    analytics: false,
  })
}

export function getClientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for']
  const first = Array.isArray(fwd) ? fwd[0] : fwd
  return first?.split(',')[0]?.trim() || 'unknown'
}

// Returns true if the request is allowed to proceed. If not, it writes the
// 429 response itself so callers can just `if (!(await ...)) return`.
export async function enforceRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  limiter: Ratelimit,
): Promise<boolean> {
  const { success, limit, remaining, reset } = await limiter.limit(getClientIp(req))
  res.setHeader('X-RateLimit-Limit', String(limit))
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining)))
  if (!success) {
    res.setHeader('Retry-After', String(Math.max(0, Math.ceil((reset - Date.now()) / 1000))))
    res.status(429).json({ error: 'Too many requests. Please try again later.' })
    return false
  }
  return true
}

export const bookingCreateLimiter = makeLimiter('booking-create', 5, '10 m')
export const attachCardLimiter = makeLimiter('attach-card', 8, '10 m')
export const judgemeReadLimiter = makeLimiter('judgeme-read', 60, '1 m')
export const judgemeWriteLimiter = makeLimiter('judgeme-write', 3, '1 h')
export const adminLimiter = makeLimiter('admin', 20, '1 m')
export const availabilityLimiter = makeLimiter('availability', 30, '1 m')
export const locationLimiter = makeLimiter('location', 30, '1 m')
