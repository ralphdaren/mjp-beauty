/** Shared details for the Made For More event page and its standalone navbar. */

export const MFM_HERO_IMG =
  'https://res.cloudinary.com/dr9nm40gf/image/upload/q_auto/f_auto/w_2000/v1786941451/full-bleed-mfm_ohghyy.png'

export const MFM_HERO_IMG_MOBILE =
  'https://res.cloudinary.com/dr9nm40gf/image/upload/c_crop,w_0.55,h_1.0,x_0,y_0/q_auto/f_auto/w_1000/v1786941451/full-bleed-mfm_ohghyy.png'

export const MFM_EVENT = {
  title: 'Made For More',
  tagline: 'Step into the next level of your beauty business',
  presenters: 'MJP Beauty | Standout Beauty | Miss NC Studio',
  intro:
    'A one-day beauty business networking experience for established beauty entrepreneurs ready to think bigger, show up differently, and step into what’s next — hosted by three Canadian beauty industry leaders.',
  date: 'October 18, 2026',
  time: '10am – 3pm',
  venue: 'Offsite YYC',
  address: '221 10 Ave SE #110, Calgary, AB',
  ticketCta: 'Save $50 — Early Bird',
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


const portrait = (id: string) =>
  `https://res.cloudinary.com/dr9nm40gf/image/upload/c_fill,g_face,w_640,h_640/q_auto/f_auto/v1786948140/${id}.jpg`

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
      photo: portrait('missnc-portrait_grttw6'),
      body: 'The mindset shifts, education, and decisions that helped her grow a fully booked Calgary salon and build her own brow training.',
    },
    {
      number: '02',
      topic: 'Visibility',
      name: 'Mia',
      brand: 'Standout Beauty',
      photo: portrait('standout-portrait_parros'),
      body: 'How showing up consistently online grew her audience — and opened doors to a product line, online academy, and salon.',
    },
    {
      number: '03',
      topic: 'Connection',
      name: 'Micah',
      brand: 'MJP Beauty',
      photo: portrait('mjpbeauty-portrait_x1bmnm'),
      body: 'How to confidently show up online, humanize your brand through storytelling, and build a personal brand that creates connection, trust, and new opportunities.',
    },
  ],
} as const

// swap for the live ticket checkout link once the client provides it.
export const MFM_TICKETS_URL = '#tickets'
