// Black Friday sale on the online brow courses. Times are Manitoba (Central, UTC-6 in November).
// The homepage popup and the announcement bar message both turn off automatically once it ends.
export const BLACK_FRIDAY = {
  startsAt: new Date('2026-11-19T08:00:00-06:00'),
  endsAt: new Date('2026-11-26T00:00:00-06:00'),
  image: 'v1794854802/black-friday_jxuwyr.jpg',
  href: '/online-brow-courses',
}

export const isBlackFridayRunning = (now = new Date()) => now < BLACK_FRIDAY.endsAt
export const hasBlackFridayStarted = (now = new Date()) => now >= BLACK_FRIDAY.startsAt
