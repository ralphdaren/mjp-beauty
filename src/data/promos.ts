// Black Friday sale on the online brow courses. Times are Manitoba, which has been on permanent UTC-5 since Nov 1, 2026.
// The homepage popup and the announcement bar message both turn off automatically once it ends.
export const BLACK_FRIDAY = {
  startsAt: new Date('2026-11-19T08:00:00-05:00'),
  endsAt: new Date('2026-11-26T00:00:00-05:00'),
  image: 'v1794854802/black-friday_jxuwyr.jpg',
  // Popup button sends people to the online courses page.
  href: '/online-brow-courses',
  // First 3 VIP enrollments get a free strategy call. Set to false once all 3 are claimed.
  vipBonusAvailable: true,
}

export const isBlackFridayRunning = (now = new Date()) => now < BLACK_FRIDAY.endsAt
export const hasBlackFridayStarted = (now = new Date()) => now >= BLACK_FRIDAY.startsAt
export const isVipBonusShowing = (now = new Date()) =>
  BLACK_FRIDAY.vipBonusAvailable && hasBlackFridayStarted(now) && isBlackFridayRunning(now)

// Time left until `target`, split for a countdown display. Clamps at zero once the target passes.
export function countdownParts(target: Date, now = new Date()) {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}
