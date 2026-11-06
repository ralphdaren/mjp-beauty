import { useEffect, useRef, useState } from 'react'
import { Check, Mail, TriangleAlert, X } from 'lucide-react'
import { formatDateTime } from './adminFormat'
import { FeeRequestError, useFeeCharge, type FeePreview, type FeeReason } from './useFeeCharge'
import { isFeeClaimStale, STALE_CLAIM_WARNING, type BookingRequest } from './serviceRequests'

interface FeeSheetProps {
  request: BookingRequest
  token: string
  onClose: () => void
  onCharged: () => void
}

type Step = 'form' | 'confirm' | 'charging' | 'done' | 'error'

interface FeeFailure {
  message: string
  retryable: boolean
  alreadyCharged: boolean
  title: string
}

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`

function parseCents(input: string): number {
  const v = parseFloat(input.replace(/[^0-9.]/g, ''))
  return Number.isNaN(v) ? 0 : Math.round(v * 100)
}

function formatBrand(brand: string): string {
  return brand
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function toFailure(err: unknown): FeeFailure {
  if (err instanceof FeeRequestError) {
    // 409 means the server refused: already charged, in progress, or no longer eligible. Never retryable.
    if (err.status === 409) {
      const already = err.alreadyCharged
      return {
        message: already ? 'This booking was already charged.' : err.message,
        retryable: false,
        alreadyCharged: already,
        title: already ? 'Already charged' : "Can't charge right now",
      }
    }
    // Outcome unknown: the server kept the booking locked. Show its message, no retry.
    if (err.keepsClaim) {
      return { message: err.message, retryable: false, alreadyCharged: false, title: 'Check Square' }
    }
    return { message: err.message, retryable: true, alreadyCharged: false, title: 'Could not charge' }
  }
  return { message: 'Something went wrong.', retryable: true, alreadyCharged: false, title: 'Could not charge' }
}

const BTN = 'rounded-full px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
const BTN_LINE = `${BTN} bg-white text-[#3d3530] border border-[#d9d1c7] hover:enabled:border-[#3d3530]`
const BTN_DARK = `${BTN} bg-[#3d3530] text-white hover:enabled:bg-[#2a2320]`

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[10.5px] uppercase tracking-[0.1em] text-[#a0948a] pt-px shrink-0">{label}</span>
      <span className="text-right min-w-0 break-words">{children}</span>
    </div>
  )
}

export default function FeeSheet({ request, token, onClose, onCharged }: FeeSheetProps) {
  const { quote, quoteError, preview, charge } = useFeeCharge(request.id, token)
  const [step, setStep] = useState<Step>('form')
  const [reason, setReason] = useState<FeeReason | null>(null)
  const [amountText, setAmountText] = useState('')
  const [previewData, setPreviewData] = useState<FeePreview | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [failure, setFailure] = useState<FeeFailure | null>(null)
  const [emailSent, setEmailSent] = useState(true)
  const [chargedCents, setChargedCents] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)
  const charging = step === 'charging'
  const [staleClaim] = useState(() => isFeeClaimStale(request, Date.now()))

  // Default reason once the quote arrives: no-show only when Square marked it, late for
  // cancelled rows. A past booking not marked no-show starts with nothing picked, so Micah
  // has to choose the reason (and the amount stays empty until she does).
  useEffect(() => {
    if (!quote || reason) return
    const wanted: FeeReason | null = request.square_no_show ? 'no_show' : request.status === 'cancelled' ? 'late' : null
    const opt = wanted ? quote.options.find((o) => o.reason === wanted) : undefined
    if (!opt) return
    setReason(opt.reason)
    setAmountText(opt.amountCents === null ? '' : (opt.amountCents / 100).toFixed(2))
  }, [quote, reason, request.status, request.square_no_show])

  useEffect(() => {
    sheetRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !charging) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [charging, onClose])

  const selected = quote?.options.find((o) => o.reason === reason) ?? null
  const amountCents = parseCents(amountText)
  const edited = !!selected && (selected.amountCents === null ? amountText !== '' : amountCents !== selected.amountCents)
  const total = quote?.totalCents ?? null

  let amountError = ''
  if (quote && selected) {
    if (amountCents <= 0) amountError = 'Enter an amount above $0.'
    else if (total !== null && amountCents > total) amountError = `Can't be more than the booking total (${money(total)}).`
  }
  const canReview = !!quote && !!selected && !!quote.card && !amountError && !reviewing

  function pickReason(r: FeeReason) {
    setReason(r)
    const opt = quote?.options.find((o) => o.reason === r)
    setAmountText(opt?.amountCents == null ? '' : (opt.amountCents / 100).toFixed(2))
  }

  async function handleReview() {
    if (!canReview) return
    setReviewing(true)
    try {
      setPreviewData(await preview(amountCents))
      setStep('confirm')
    } catch (err) {
      setFailure(toFailure(err))
      setStep('error')
    } finally {
      setReviewing(false)
    }
  }

  async function handleCharge() {
    if (!reason || !previewData) return
    setStep('charging')
    try {
      const result = await charge(reason, amountCents)
      setChargedCents(result.chargedCents)
      setEmailSent(result.emailSent)
      setStep('done')
      onCharged()
    } catch (err) {
      const f = toFailure(err)
      setFailure(f)
      setStep('error')
      if (f.alreadyCharged || !f.retryable) onCharged()
    }
  }

  const cardLabel = quote?.card ? `${formatBrand(quote.card.brand)} ending ${quote.card.last4}` : ''
  const clientName = `${request.first_name} ${request.last_name}`

  function renderHead(title: string, sub: string) {
    return (
      <div className="flex items-start justify-between gap-3 px-[22px] pt-5">
        <div>
          <h2 id="fee-sheet-title" className="text-[17px] font-semibold text-[#3d3530]">
            {title}
          </h2>
          <p className="text-xs text-[#6b5f58] mt-0.5">{sub}</p>
        </div>
        {!charging && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-[30px] h-[30px] rounded-full bg-[#f6f2ec] text-[#6b5f58] grid place-items-center hover:bg-[#ece7e0]"
          >
            <X size={15} />
          </button>
        )}
      </div>
    )
  }

  const bodyCls = 'px-[22px] py-4 flex flex-col gap-4 text-xs text-[#3d3530]'
  const footCls = 'px-[22px] pb-5 flex flex-wrap justify-end gap-2'

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2a2320]/40 flex items-end md:items-center justify-center md:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !charging) onClose()
      }}
    >
      <div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fee-sheet-title"
        className="bg-white w-full md:max-w-[520px] max-h-[92vh] overflow-y-auto rounded-t-[22px] md:rounded-2xl shadow-2xl outline-none flex flex-col"
      >
        {step === 'form' && (
          <>
            {renderHead('Charge cancellation fee', `${clientName} · ${formatDateTime(request.start_at)}`)}
            {quoteError ? (
              <>
                <div className={bodyCls}>
                  <p className="text-red-500">{quoteError}</p>
                </div>
                <div className={footCls}>
                  <button onClick={onClose} className={BTN_LINE}>
                    Close
                  </button>
                </div>
              </>
            ) : !quote ? (
              <div className={bodyCls}>
                <p className="text-[#a0948a]">Loading from Square…</p>
              </div>
            ) : (
              <>
                <div className={bodyCls}>
                  {staleClaim && (
                    <p className="flex items-start gap-2 rounded-xl bg-[#fdf3e1] text-[#b7791f] px-3 py-2.5 text-[12.5px]" role="alert">
                      <TriangleAlert size={14} className="shrink-0 mt-0.5" />
                      {STALE_CLAIM_WARNING}
                    </p>
                  )}
                  <div className="bg-[#f6f2ec] rounded-xl p-3.5 space-y-2">
                    {quote.services.map((s, i) => (
                      <div key={`${s.tierLabel}-${i}`} className="flex justify-between gap-3">
                        <span className="min-w-0">
                          {s.serviceName}
                          <span className="block text-[#a0948a]">{s.tierLabel}</span>
                        </span>
                        <span className="tabular-nums shrink-0">
                          {s.priceCents === null ? 'No price' : money(s.priceCents)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-3 border-t border-[#e6ddd2] pt-2 font-semibold">
                      {total !== null ? (
                        <>
                          <span>Booking total (GST incl.)</span>
                          <span className="tabular-nums">{money(total)}</span>
                        </>
                      ) : (
                        <span>Price not set in Square, enter the amount</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#a0948a] mb-2">
                      What happened?
                    </p>
                    <div className="flex flex-col gap-1.5" role="radiogroup">
                      {quote.options.map((o) => {
                        const on = o.reason === reason
                        return (
                          <label
                            key={o.reason}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border cursor-pointer text-[13px] focus-within:outline-2 focus-within:outline-[#b07d4e] ${on ? 'border-[#3d3530] bg-[#fbf9f6]' : 'border-[#e3e2de] hover:border-[#cfc4b8]'}`}
                          >
                            <input
                              type="radio"
                              name="fee-reason"
                              checked={on}
                              onChange={() => pickReason(o.reason)}
                              className="w-4 h-4 accent-[#3d3530] shrink-0"
                            />
                            <span className="flex-1 min-w-0">
                              {o.label} · {o.pct}%
                              <span className="block text-[11.5px] text-[#a0948a]">{o.detail}</span>
                            </span>
                            {o.amountCents !== null && (
                              <span className="font-semibold tabular-nums">{money(o.amountCents)}</span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#a0948a] mb-2">
                      Amount to charge
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="flex items-center w-[150px] border border-[#e3e2de] rounded-xl px-3 bg-white focus-within:border-[#3d3530]">
                        <span className="text-[#a0948a]">$</span>
                        <input
                          inputMode="decimal"
                          value={amountText}
                          onChange={(e) => setAmountText(e.target.value)}
                          aria-label="Amount to charge"
                          className="w-full bg-transparent border-0 outline-none px-1.5 py-2.5 text-[15px] font-semibold tabular-nums"
                        />
                      </label>
                      <span
                        className={`text-[11.5px] ${amountError || edited ? 'text-amber-700' : 'text-[#a0948a]'}`}
                      >
                        {amountError ||
                          (edited && selected?.amountCents != null
                            ? `Changed from ${money(selected.amountCents)}. Fine for special cases.`
                            : selected && total !== null
                              ? `${selected.pct}% of ${money(total)}, GST included`
                              : '')}
                      </span>
                    </div>
                  </div>

                  {quote.card ? (
                    <p className="text-[13px]">
                      Card on file: <strong>{cardLabel}</strong>
                    </p>
                  ) : (
                    <p className="text-[13px] text-red-500">{quote.cardError ?? 'No card on file'}</p>
                  )}
                  <p className="flex items-baseline gap-2 text-[#6b5f58]">
                    <Mail size={13} className="shrink-0 translate-y-0.5" />
                    <span>{quote.firstName || request.first_name} will get an email explaining the charge.</span>
                  </p>
                </div>
                <div className={footCls}>
                  <button onClick={onClose} className={BTN_LINE}>
                    Cancel
                  </button>
                  <button onClick={handleReview} disabled={!canReview} className={BTN_DARK}>
                    {reviewing ? 'Checking…' : 'Review charge'}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === 'confirm' && previewData && selected && (
          <>
            {renderHead("Confirm the charge", "Check this before charging. It goes through right away.")}
            <div className={bodyCls}>
              <div className="text-center pt-1.5">
                <div className="text-[34px] font-semibold tracking-tight tabular-nums">{money(previewData.chargeCents)}</div>
                <div className="text-[13px] text-[#6b5f58]">to {cardLabel}</div>
              </div>
              <div className="bg-[#f6f2ec] rounded-xl p-3.5 space-y-2">
                <Line label="Client">{clientName}</Line>
                <Line label="Reason">
                  {selected.label}
                  {edited ? ' (amount changed)' : ` · ${selected.pct}%`}
                </Line>
                <Line label="GST incl.">
                  <span className="tabular-nums">{money(previewData.gstCents)}</span>
                </Line>
                <Line label="Email to">{quote?.email ?? request.email}</Line>
              </div>
              <p className="text-[11.5px] text-[#a0948a]">
                A booking can only be charged once. Refunds are done in Square.
              </p>
            </div>
            <div className={footCls}>
              <button onClick={() => setStep('form')} className={BTN_LINE}>
                Back
              </button>
              <button onClick={handleCharge} className={BTN_DARK}>
                Charge {money(previewData.chargeCents)}
              </button>
            </div>
          </>
        )}

        {step === 'charging' && (
          <>
            {renderHead("Charging…", cardLabel)}
            <div className={bodyCls}>
              <p className="text-center text-[13px] text-[#6b5f58] py-2" role="status">
                Talking to Square. This takes a second or two.
              </p>
            </div>
          </>
        )}

        {step === 'done' && (
          <>
            {renderHead("Fee charged", clientName)}
            <div className={bodyCls}>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-[52px] h-[52px] rounded-full bg-[#e7f3ec] text-[#4a9d6f] grid place-items-center">
                  <Check size={24} />
                </div>
                <h3 className="text-lg font-semibold mt-1.5">{money(chargedCents)} charged</h3>
                <p className="text-[13px] text-[#6b5f58]">
                  {selected?.label} fee on {cardLabel}.
                </p>
              </div>
              <ul className="space-y-1.5 text-[12.5px] text-[#6b5f58]">
                <li>
                  <span className="text-[#4a9d6f] font-bold mr-2">✓</span>
                  Shows in Square as a normal sale on {request.first_name}'s profile
                </li>
                {emailSent && (
                  <li>
                    <span className="text-[#4a9d6f] font-bold mr-2">✓</span>
                    Email sent to {quote?.email ?? request.email}
                  </li>
                )}
                <li>
                  <span className="text-[#4a9d6f] font-bold mr-2">✓</span>
                  Booking marked "Fee charged" so it can't be charged twice
                </li>
              </ul>
              {!emailSent && (
                <p className="flex items-start gap-2 rounded-xl bg-[#fdf3e1] text-[#b7791f] px-3 py-2.5 text-[12.5px]">
                  <TriangleAlert size={14} className="shrink-0 mt-0.5" />
                  Charged, but the email didn't send. Let the client know directly.
                </p>
              )}
            </div>
            <div className={footCls}>
              <button onClick={onClose} className={BTN_DARK}>
                Done
              </button>
            </div>
          </>
        )}

        {step === 'error' && failure && (
          <>
            {renderHead(failure.title, clientName)}
            <div className={bodyCls}>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-[52px] h-[52px] rounded-full bg-[#fbeceb] text-[#c2453b] grid place-items-center">
                  <TriangleAlert size={22} />
                </div>
                <p className="text-[13px] text-[#3d3530] max-w-[40ch] mt-1.5">{failure.message}</p>
                {failure.retryable && <p className="text-[13px] font-semibold">Nothing was charged.</p>}
              </div>
            </div>
            <div className={footCls}>
              <button onClick={onClose} className={BTN_LINE}>
                Close
              </button>
              {failure.retryable && (
                <button onClick={() => setStep('form')} className={BTN_DARK}>
                  Try again
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
