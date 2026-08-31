/** Shared details for the Made For More event page and its standalone navbar. */

const heroPortrait = (w: number) =>
  `https://res.cloudinary.com/dr9nm40gf/image/upload/c_crop,x_67,y_32,w_833,h_871/f_auto,q_auto,w_${w}/v1787159669/portrait-mfm_qut98y.png`

export const MFM_HERO_PORTRAITS = {
  src: heroPortrait(833),
  srcSet: [420, 620, 833].map((w) => `${heroPortrait(w)} ${w}w`).join(', '),
  sizes: '(min-width: 1024px) 30rem, 78vw',
} as const

export const MFM_HERO_PORTRAITS_RATIO = '833 / 871'

export const MFM_HERO_HOSTS = [
  { key: 'micah', name: 'Micah', brand: 'MJP Beauty' },
  { key: 'mia', name: 'Mia', brand: 'Standout Beauty' },
  { key: 'nicole', name: 'Nicole', brand: 'Miss NC' },
] as const

export const MFM_EVENT = {
  title: 'Made For More',
  eyebrow: 'An exclusive event for beauty artists',
  tagline: 'Where artistry meets ambition',
  date: 'October 18, 2026',
  time: '10am – 4pm',
  city: 'Calgary, Alberta',
  country: 'Canada',
  earlyBird: 'Early bird opens September 1st',
  earlyBirdNote: '(Available for 72 hrs only)',
  venue: 'Offsite YYC',
  address: '221 10 Ave SE #110, Calgary, AB',
  addressFull: '221 10 Ave SE #110, Calgary, AB T2G 0V9',
} as const

export const MFM_INTRO = {
  openers: ['You built the business.', 'You mastered your craft.', 'You found the clients.'],
  transition: 'But lately, you’ve been wondering…',
  question: 'What’s next for me?',
  body: 'Maybe taking clients back-to-back doesn’t excite you the way it used to. Maybe you know you’re capable of more — but you’re not sure what that “more” looks like yet.',
  statementLead: 'MADE FOR MORE',
  statementRest: 'is for the beauty business owner who’s ready to stop playing small.',
} as const

export const MFM_INVITATION = {
  eyebrow: 'The Invitation',
  headingLead: 'You’re not starting over.',
  headingAccent: 'You’re expanding.',
  body: 'There comes a point in business where the goal isn’t just to get more clients. It’s to build the confidence to take bigger risks, create new opportunities, and step into the entrepreneur you know you’re capable of becoming.',
  hostsLead: 'On October 18th, join',
  hosts: [
    { name: 'Micah', brand: 'MJP Beauty' },
    { name: 'Mia', brand: 'Standout Beauty' },
    { name: 'Nicole', brand: 'Miss NC Beauty' },
  ],
  hostsTail: 'for an intimate beauty business networking event in Calgary.',
  closingLines: ['Three beauty entrepreneurs.', 'Three completely different journeys.'],
  closingFinal: 'One room full of women ready for more.',
} as const

export const MFM_QUALIFIER = {
  eyebrow: 'Is This You?',
  heading: 'This room is for you if…',
  items: [
    'You’ve built something you’re proud of, but you know you haven’t reached your full potential yet.',
    'You’re craving new opportunities.',
    'You want to think bigger about what your beauty business could become.',
  ],
  closingLead: 'And most importantly…',
  closingRest: 'you’re ready to stop waiting for permission to enter your next era.',
} as const

const portrait = (version: string, id: string) =>
  `https://res.cloudinary.com/dr9nm40gf/image/upload/c_fill,g_face,w_640,h_640/q_auto/f_auto/${version}/${id}.jpg`

export const MFM_PILLARS = {
  eyebrow: 'The 3 Pillars',
  headingLead: 'What the hosts will',
  headingAccent: 'share',
  items: [
    {
      number: '01',
      topic: 'Mindset',
      name: 'Nicole',
      brand: 'Miss NC Beauty',
      photo: portrait('v1787158235', 'missnc-portrait_iprqs0'),
      body: 'The mindset shifts, education, and decisions that helped her grow a fully booked Calgary salon and build her own brow training.',
    },
    {
      number: '02',
      topic: 'Visibility',
      name: 'Mia',
      brand: 'Standout Beauty',
      photo: portrait('v1787160461', 'standout-portrait_ze8wge'),
      body: 'How showing up consistently online grew her audience — and opened doors to a product line, online academy, and salon.',
    },
    {
      number: '03',
      topic: 'Connection',
      name: 'Micah',
      brand: 'MJP Beauty',
      photo: portrait('v1786948140', 'mjpbeauty-portrait_x1bmnm'),
      body: 'How to confidently show up online, humanize your brand through storytelling, and build a personal brand that creates connection, trust, and new opportunities.',
    },
  ],
} as const

export const MFM_CTA = {
  headingLead: 'You were made',
  headingTail: 'for',
  headingAccent: 'more',
  lines: [
    'Come for the conversations.',
    'Come for the connections.',
    'Leave with the confidence to make your next move.',
  ],
  eyebrow: 'Made For More',
  where: `${MFM_EVENT.venue}, Calgary, Alberta`,
  cta: 'Get First Access to Early-Bird Tickets',
  note: 'Limited tickets available.',
} as const

export const MFM_NEW_BADGE_UNTIL = '2026-10-19'
export const isMadeForMoreNew = () => Date.now() < new Date(MFM_NEW_BADGE_UNTIL).getTime()
export const MFM_WAITLIST_URL = 'https://mjpbeauty.myflodesk.com/made-for-more-beauty-biz-event'
export const MFM_TICKETS_PATH = '/made-for-more-calgary/tickets'
export const MFM_TICKETS_HANDLE = 'made-for-more-calgary'

export const MFM_EARLY_BIRD = {
  startsAt: '2026-09-01T17:00:00Z',
  endsAt: '2026-09-04T17:00:00Z',
  saving: 50,
} as const

export const isEarlyBird = (now: number = Date.now()) =>
  now >= Date.parse(MFM_EARLY_BIRD.startsAt) && now < Date.parse(MFM_EARLY_BIRD.endsAt)

/** Tickets go on sale when the early-bird window opens; until then the CTA
 *  still points at the Flodesk waitlist. */
export const ticketsHref = (now: number = Date.now()) =>
  now >= Date.parse(MFM_EARLY_BIRD.startsAt) ? MFM_TICKETS_PATH : MFM_WAITLIST_URL

/** GST only, added on top at checkout — confirmed with the client 2026-08-31.
 *  Ticket prices are therefore pre-tax: $197 is charged as $206.85.
 *
 *  Stays accurate only while "Include tax in prices" is OFF in the Shopify tax
 *  settings. Turning it on would make these prices tax-inclusive and this line
 *  a lie, so the two have to move together. */
export const MFM_TAX_NOTE = 'plus GST'

/** Perks shared by every tier. */
export const MFM_TICKET_INCLUDED = [
  'Light appetizers and desserts',
  'A beverage on arrival',
  'Entry to win a door prize',
  'Certificate of attendance',
] as const

/** Keyed to the Shopify variant titles — matching is by `variantTitle`, so
 *  renaming a variant in Shopify without updating this drops the tier.
 *
 *  Seat counts live in Shopify inventory (70 general, 30 VIP), not here — Micah
 *  may release more general seats later, so no copy hardcodes a number. Both
 *  tiers can sell out, and each card reads its own `availableForSale`. */
export const MFM_TICKET_TIERS = [
  {
    variantTitle: 'General Admission',
    name: 'General Admission',
    blurb: 'A seat in the room, and everything that comes with the day.',
    perks: ['Standout Beauty goody bag, valued at $120'],
  },
  {
    variantTitle: 'VIP',
    name: 'VIP',
    blurb: 'Closest to the front, and in the draw for the grand prize.',
    perks: [
      'Front-row seating',
      'Standout Beauty goody bag, valued at $250',
      'Entered to win every course, products included',
    ],
    limitNote: 'Only 30 spots',
  },
] as const
