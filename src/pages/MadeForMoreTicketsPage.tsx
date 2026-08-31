import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import MadeForMoreNavbar from '@/components/MadeForMoreNavbar'
import { createCheckoutUrl, getProductByHandle, type ShopifyVariant } from '@/lib/shopify'
import {
  MFM_EARLY_BIRD,
  MFM_EVENT,
  MFM_TAX_NOTE,
  MFM_TICKETS_HANDLE,
  MFM_TICKET_INCLUDED,
  MFM_TICKET_TIERS,
  isEarlyBird,
} from '@/data/madeForMore'

/** Shopify returns "247.0" — tickets are always whole dollars. */
const dollars = (amount: string) => `$${Math.round(parseFloat(amount))}`

type Tier = (typeof MFM_TICKET_TIERS)[number]

/** Ticks once a second while the early-bird window is open, so the countdown
 *  and the tier pricing flip together the moment it closes. */
function useEarlyBirdCountdown() {
  const endsAt = useMemo(() => Date.parse(MFM_EARLY_BIRD.endsAt), [])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (now >= endsAt) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [now, endsAt])

  const remaining = Math.max(0, endsAt - now)
  return {
    active: isEarlyBird(now),
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  }
}

function Countdown() {
  const { active, days, hours, minutes, seconds } = useEarlyBirdCountdown()
  if (!active) return null

  const cells = [
    { value: days, label: days === 1 ? 'day' : 'days' },
    { value: hours, label: 'hrs' },
    { value: minutes, label: 'min' },
    { value: seconds, label: 'sec' },
  ]

  return (
    <div className="mfm-countdown">
      <p className="font-sans mfm-eyebrow mfm-countdown-label">
        Early bird ends in
      </p>
      <div className="mfm-countdown-cells">
        {cells.map(({ value, label }) => (
          <div key={label} className="mfm-countdown-cell">
            <span className="mfm-countdown-value">{String(value).padStart(2, '0')}</span>
            <span className="font-sans mfm-countdown-unit">{label}</span>
          </div>
        ))}
      </div>
      <p className="font-sans mfm-countdown-note">
        Save ${MFM_EARLY_BIRD.saving} on general admission until noon on September 4.
      </p>
    </div>
  )
}

function TicketCard({
  tier,
  variant,
  instagram,
}: {
  tier: Tier
  variant: ShopifyVariant | undefined
  instagram: string
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const soldOut = !variant || !variant.availableForSale
  const isGeneral = tier.variantTitle === 'General Admission'
  const { active: earlyBirdActive } = useEarlyBirdCountdown()

  // Shopify applies the early-bird discount at checkout, so the variant price
  // is always the full $247. Show what they'll actually be charged.
  const showDiscount = isGeneral && earlyBirdActive && variant
  const fullPrice = variant ? parseFloat(variant.price) : 0
  const paidPrice = showDiscount ? fullPrice - MFM_EARLY_BIRD.saving : fullPrice

  async function handleCheckout() {
    if (!variant || busy) return
    setBusy(true)
    setError(null)

    const handle = instagram.trim().replace(/^@+/, '')
    const url = await createCheckoutUrl(variant.id, {
      attributes: handle ? { Instagram: `@${handle}` } : undefined,
    })

    if (!url) {
      setError('Could not start checkout. Please try again.')
      setBusy(false)
      return
    }
    window.location.href = url
  }

  return (
    <article className={`mfm-ticket${soldOut ? ' mfm-ticket--sold' : ''}`}>
      <div className="mfm-ticket-head">
        <h2 className="font-sans mfm-ticket-name">{tier.name}</h2>
        {showDiscount && <span className="font-sans mfm-ticket-flag">Early bird</span>}
        {'limitNote' in tier && !soldOut && (
          <span className="font-sans mfm-ticket-limit">{tier.limitNote}</span>
        )}
      </div>

      <div className="mfm-ticket-price">
        {variant ? (
          <>
            <span className="mfm-ticket-amount">{dollars(String(paidPrice))}</span>
            {showDiscount && (
              <span className="mfm-ticket-was">
                <span className="sr-only">Regular price </span>
                {dollars(String(fullPrice))}
              </span>
            )}
            <span className="font-sans mfm-ticket-tax">
              {variant.currencyCode} · {MFM_TAX_NOTE}
            </span>
          </>
        ) : (
          <span className="mfm-ticket-amount mfm-ticket-amount--placeholder">—</span>
        )}
      </div>

      <p className="mfm-ticket-blurb">{tier.blurb}</p>

      <ul className="mfm-ticket-perks">
        {[...tier.perks, ...MFM_TICKET_INCLUDED].map((perk) => (
          <li key={perk}>
            <Check className="mfm-ticket-tick" aria-hidden="true" />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="font-sans mfm-ticket-error">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={soldOut || busy}
        className="font-sans mfm-ticket-btn"
      >
        {busy && <Loader2 className="mfm-ticket-spinner" aria-hidden="true" />}
        {soldOut ? 'Sold out' : busy ? 'Taking you to checkout' : `Get ${tier.name}`}
      </button>
    </article>
  )
}

export default function MadeForMoreTicketsPage() {
  const [variants, setVariants] = useState<ShopifyVariant[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [instagram, setInstagram] = useState('')

  useEffect(() => {
    let cancelled = false
    getProductByHandle(MFM_TICKETS_HANDLE).then((product) => {
      if (cancelled) return
      if (!product) {
        setFailed(true)
        return
      }
      setVariants(product.variants)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const byTitle = useMemo(() => {
    const map = new Map<string, ShopifyVariant>()
    for (const variant of variants ?? []) map.set(variant.title, variant)
    return map
  }, [variants])

  return (
    <main className="mfm-tickets-page">
      <MadeForMoreNavbar />

      <section className="mfm-tickets">
        <header className="mfm-tickets-head">
          <p className="font-sans mfm-eyebrow">{MFM_EVENT.title}</p>
          <h1 className="hero-heading font-sans mfm-tickets-title">
            Reserve your <em>seat.</em>
          </h1>
          <p className="about-subheading mfm-tickets-where">
            {MFM_EVENT.date} · {MFM_EVENT.time} · {MFM_EVENT.venue}
          </p>
          <p className="font-sans mfm-tickets-address">{MFM_EVENT.addressFull}</p>
        </header>

        <Countdown />

          <label className="mfm-ticket-field">
          <span className="font-sans mfm-ticket-field-label">Instagram handle</span>
          <input
            type="text"
            autoComplete="off"
            placeholder="Your Instagram username, like @mjpbeauty"
            value={instagram}
            onChange={(event) => setInstagram(event.target.value)}
            className="font-sans mfm-ticket-input"
          />
          <span className="font-sans mfm-ticket-field-hint">
            A second way to reach you, and so we can tag you when we share the day.
          </span>
        </label>

        {failed ? (
          <p role="alert" className="font-sans mfm-tickets-error">
            Tickets aren’t loading right now. Please refresh, or message us on Instagram and
            we’ll sort you out.
          </p>
        ) : (
          <div className="mfm-tickets-grid" aria-busy={variants === null}>
            {MFM_TICKET_TIERS.map((tier) => (
              <TicketCard
                key={tier.variantTitle}
                tier={tier}
                variant={byTitle.get(tier.variantTitle)}
                instagram={instagram}
              />
            ))}
          </div>
        )}

        <p className="font-sans mfm-tickets-foot">
          Payment is handled securely by Shopify. You’ll get a receipt and your confirmation
          ticket by email as soon as it goes through.
        </p>
      </section>
    </main>
  )
}
