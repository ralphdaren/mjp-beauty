import { useMemo, useState } from 'react'
import { Plus, Send, Trash2, X, ChevronDown, Search, FlaskConical } from 'lucide-react'
import { formatSubmitted } from './adminFormat'
import type { Refetch } from './adminShell'

export interface MfmTicket {
  id: string
  shopify_order_id: string
  order_number: string | null
  email: string
  customer_name: string
  instagram: string | null
  items: { tier: string; quantity: number }[]
  total_cents: number
  currency: string
  ordered_at: string
  email_sent_at: string | null
  notes?: string | null
}

type Filter = 'all' | 'shopify' | 'plan'

interface FormState {
  email: string
  name: string
  tier: 'General Admission' | 'VIP'
  quantity: string
  total: string
  notes: string
  instagram: string
  testMode: boolean
  testTo: string
}

const EMPTY_FORM: FormState = {
  email: '',
  name: '',
  tier: 'General Admission',
  quantity: '1',
  total: '',
  notes: '',
  instagram: '',
  testMode: false,
  testTo: '',
}

/** Mirrors api/_mfm-config.ts — what each Square invoice charges, per seat. */
const PLAN_INSTALLMENT = { 'General Admission': 130.0, VIP: 207.5 } as const
const PLAN_PAYMENTS = 2

const isPlan = (t: MfmTicket) => String(t.shopify_order_id ?? '').startsWith('square:')
const money = (cents: number) =>
  `$${(cents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const seatCount = (t: MfmTicket) =>
  (Array.isArray(t.items) ? t.items : []).reduce((sum, i) => sum + (i.quantity ?? 1), 0)

function RowSkeleton() {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
      <div className="h-3.5 w-44 bg-[#ece7e0] rounded-full animate-pulse mb-2" />
      <div className="h-3 w-64 bg-[#f1ece5] rounded-full animate-pulse" />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
      <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-1">{label}</p>
      <p className="text-lg font-semibold text-[#3d3530]">{value}</p>
    </div>
  )
}

export default function MadeForMorePanel({
  token,
  tickets,
  loading,
  error,
  onRefetch,
}: {
  token: string
  tickets: MfmTicket[]
  loading: boolean
  error: string
  onRefetch: Refetch
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  // A test leaves the modal open, so its confirmation has to show inside it —
  // the page-level notice would be behind the backdrop.
  const [formNotice, setFormNotice] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const stats = useMemo(() => {
    const seats = tickets.reduce((sum, t) => sum + seatCount(t), 0)
    const ga = tickets
      .flatMap((t) => (Array.isArray(t.items) ? t.items : []))
      .filter((i) => i.tier === 'General Admission')
      .reduce((s, i) => s + (i.quantity ?? 1), 0)
    const gross = tickets.reduce((sum, t) => sum + t.total_cents, 0)
    return {
      seats,
      ga,
      vip: seats - ga,
      gross,
      plans: tickets.filter(isPlan).length,
      unsent: tickets.filter((t) => !t.email_sent_at).length,
    }
  }, [tickets])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tickets.filter((t) => {
      if (filter === 'plan' && !isPlan(t)) return false
      if (filter === 'shopify' && isPlan(t)) return false
      if (!q) return true
      return (
        t.customer_name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.order_number?.toLowerCase().includes(q) ||
        t.notes?.toLowerCase().includes(q)
      )
    })
  }, [tickets, filter, search])

  // The buyer pays PLAN_PAYMENTS invoices of `installment`; `planTotal` is what
  // gets stored, so the Gross stat counts the whole ticket.
  const plan = (() => {
    const qty = Number(form.quantity) || 1
    const installment = PLAN_INSTALLMENT[form.tier] * qty
    return {
      installment: installment.toFixed(2),
      total: (installment * PLAN_PAYMENTS).toFixed(2),
    }
  })()

  async function post(body: Record<string, unknown>) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ resource: 'mfm-tickets', ...body }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
    return data
  }

  async function handleSave() {
    if (!form.email.trim()) return setFormError('Please enter their email address.')
    if (!form.name.trim()) return setFormError('Please enter their name.')
    if (form.testMode && !form.testTo.trim()) {
      return setFormError('Enter the address the test should go to.')
    }

    setSaving(true)
    setFormError('')
    setFormNotice('')
    try {
      const data = await post({
        action: 'create',
        email: form.email.trim(),
        name: form.name.trim(),
        tier: form.tier,
        quantity: Number(form.quantity) || 1,
        total: form.total.trim(),
        notes: form.notes.trim(),
        instagram: form.instagram.trim(),
        ...(form.testMode ? { testTo: form.testTo.trim() } : {}),
      })
      if (data.testTo) {
        setFormNotice(
          `Test ticket ${data.orderNumber} sent to ${data.testTo}. Nothing was saved and no ticket was issued.`,
        )
      } else {
        setFormOpen(false)
        setForm(EMPTY_FORM)
        setNotice(`Ticket ${data.orderNumber} sent to ${form.email.trim()}.`)
      }
      await onRefetch({ silent: true })
    } catch (err) {
      setFormError(String(err).replace('Error: ', ''))
    } finally {
      setSaving(false)
    }
  }

  async function handleResend(t: MfmTicket) {
    if (!confirm(`Re-send ticket ${t.order_number} to ${t.email}?`)) return
    setBusyId(t.id)
    setNotice('')
    try {
      await post({ action: 'resend', id: t.id })
      setNotice(`Ticket ${t.order_number} re-sent to ${t.email}.`)
      await onRefetch({ silent: true })
    } catch (err) {
      alert(String(err).replace('Error: ', ''))
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(t: MfmTicket) {
    if (!confirm(`Remove ${t.customer_name}'s payment-plan ticket (${t.order_number})?\n\nThis only removes the record here — it does not refund or cancel anything in Square.`)) return
    setBusyId(t.id)
    setNotice('')
    try {
      await post({ action: 'delete', id: t.id })
      await onRefetch({ silent: true })
    } catch (err) {
      alert(String(err).replace('Error: ', ''))
    } finally {
      setBusyId(null)
    }
  }

  const FILTERS: Array<{ id: Filter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: tickets.length },
    { id: 'shopify', label: 'Shopify', count: tickets.length - stats.plans },
    { id: 'plan', label: 'Payment plans', count: stats.plans },
  ]

  return (
    <div className="px-6 py-5 max-w-5xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label="Seats sold" value={loading ? '—' : String(stats.seats)} />
        <Stat label="GA / VIP" value={loading ? '—' : `${stats.ga} / ${stats.vip}`} />
        <Stat label="Gross" value={loading ? '—' : money(stats.gross)} />
        <Stat label="Payment plans" value={loading ? '—' : String(stats.plans)} />
      </div>

      {stats.unsent > 0 && (
        <p className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          {stats.unsent} ticket{stats.unsent === 1 ? '' : 's'} recorded but never emailed. Use Re-send on those rows.
        </p>
      )}

      {notice && (
        <div className="mb-4 flex items-start justify-between gap-3 text-xs text-[#3d3530] bg-[#eef5ef] border border-[#cfe3d4] rounded-xl px-4 py-3">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss" className="shrink-0 text-[#6b5f58] hover:text-[#3d3530]">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-full px-3.5 py-2 text-xs transition-colors ${
                filter === f.id
                  ? 'bg-[#3d3530] text-white'
                  : 'bg-white text-[#6b5f58] border border-[#e3e2de] hover:border-[#3d3530] hover:text-[#3d3530]'
              }`}
            >
              {f.label} {!loading && <span className="opacity-60">{f.count}</span>}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-0">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a0948a]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, ticket number…"
            className="w-full border border-[#e3e2de] rounded-full pl-9 pr-3 py-2 text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white"
          />
        </div>

        <button
          onClick={() => {
            setForm(EMPTY_FORM)
            setFormError('')
            setFormNotice('')
            setFormOpen(true)
          }}
          className="flex shrink-0 items-center justify-center gap-1.5 bg-[#3d3530] text-white text-xs tracking-[0.1em] uppercase rounded-full px-4 py-2.5 hover:bg-[#2a2320] transition-colors"
        >
          <Plus size={15} />
          Add Plan
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {!loading && visible.length === 0 && (
        <div className="text-center py-16 text-[#a0948a] text-sm">
          {tickets.length === 0 ? 'No tickets yet.' : 'Nothing matches that filter.'}
        </div>
      )}

      <div className="space-y-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
          : visible.map((t) => {
              const plan = isPlan(t)
              const tiers = (Array.isArray(t.items) ? t.items : [])
                .map((i) => (i.quantity > 1 ? `${i.tier} × ${i.quantity}` : i.tier))
                .join(', ')
              return (
                <div key={t.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#3d3530]">{t.customer_name}</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] ${
                            plan ? 'bg-[#f6ebe0] text-[#b07d4e]' : 'bg-[#f0ece6] text-[#6b5f58]'
                          }`}
                        >
                          {plan ? 'Payment plan' : 'Shopify'}
                        </span>
                        {!t.email_sent_at && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.08em] bg-red-50 text-red-500">
                            Not emailed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6b5f58] mt-0.5 break-all">{t.email}</p>
                      <p className="text-xs text-[#a0948a] mt-1">
                        {t.order_number} · {tiers} · {money(t.total_cents)}
                        {plan && ` (${PLAN_PAYMENTS} × ${money(Math.round(t.total_cents / PLAN_PAYMENTS))})`} ·{' '}
                        {formatSubmitted(t.ordered_at)}
                      </p>
                      {t.notes && <p className="text-xs text-[#a0948a] mt-1">Square: {t.notes}</p>}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleResend(t)}
                        disabled={busyId === t.id}
                        className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-white border border-[#e3e2de] text-[#6b5f58] text-xs tracking-[0.1em] uppercase rounded-full hover:enabled:border-[#3d3530] hover:enabled:text-[#3d3530] disabled:opacity-50 transition-colors"
                      >
                        <Send size={13} />
                        Re-send
                      </button>
                      {plan && (
                        <button
                          onClick={() => handleDelete(t)}
                          disabled={busyId === t.id}
                          aria-label={`Remove ${t.customer_name}`}
                          className="flex items-center justify-center py-2 px-3.5 bg-white border border-red-200 text-red-500 rounded-full hover:enabled:bg-red-500 hover:enabled:border-red-500 hover:enabled:text-white disabled:opacity-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
      </div>

      {/* Add payment-plan ticket */}
      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 modal-backdrop-in" onClick={() => !saving && setFormOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-[420px] shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto modal-pop-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e3e2de]">
              <h3 className="text-sm font-semibold text-[#3d3530]">Add Payment-Plan Ticket</h3>
              <button onClick={() => !saving && setFormOpen(false)} className="p-1 rounded-full hover:bg-[#f0ece6] transition-colors" aria-label="Close">
                <X size={16} className="text-[#827064]" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <p className="text-xs text-[#a0948a] leading-relaxed">
                For buyers invoiced through Square. Their ticket email sends as soon as you save — the same
                email Shopify buyers get.
              </p>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Rereloluwa Oyebanji"
                  className="w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="where the ticket goes"
                  className="w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">Ticket</label>
                  <div className="relative">
                    <select
                      value={form.tier}
                      onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value as FormState['tier'] }))}
                      className="w-full appearance-none border border-[#e3e2de] rounded-lg pl-3 pr-9 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#827064] bg-white"
                    >
                      <option value="General Admission">General Admission</option>
                      <option value="VIP">VIP</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a0948a]" />
                  </div>
                </div>
                <div className="w-24">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#827064] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">
                  Total they're paying
                </label>
                <p className="mb-1.5 text-xs text-[#6b5f58]">
                  {form.tier} is{' '}
                  <span className="font-semibold text-[#3d3530]">${plan.installment}</span> per
                  payment — {PLAN_PAYMENTS} payments, ${plan.total} in total.
                </p>
                <input
                  type="text"
                  inputMode="decimal"
                  value={form.total}
                  onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
                  placeholder={`Leave blank for $${plan.total}`}
                  className="w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white"
                />
                <p className="mt-1 text-[11px] text-[#a0948a]">
                  Enter the full amount across all their Square invoices, not one payment. Their
                  ticket shows the per-payment figure.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">
                  Square invoice numbers <span className="normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. 000061, 000062"
                  className="w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a0948a] mb-1.5">
                  Instagram <span className="normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                  placeholder="@handle"
                  className="w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white"
                />
              </div>

              <div className="rounded-xl border border-[#e3e2de] bg-[#faf8f5] px-4 py-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.testMode}
                    onChange={(e) => setForm((f) => ({ ...f, testMode: e.target.checked }))}
                    className="accent-[#3d3530]"
                  />
                  <FlaskConical size={13} className="text-[#a0948a]" />
                  <span className="text-xs text-[#6b5f58]">Send me a test instead</span>
                </label>
                {form.testMode && (
                  <>
                    <input
                      type="email"
                      value={form.testTo}
                      onChange={(e) => setForm((f) => ({ ...f, testTo: e.target.value }))}
                      placeholder="your@email.com"
                      className="mt-2.5 w-full border border-[#e3e2de] rounded-lg px-3 py-2.5 text-sm text-[#3d3530] placeholder:text-[#c0b4ac] focus:outline-none focus:border-[#827064] bg-white"
                    />
                    <p className="mt-1.5 text-[11px] text-[#a0948a]">
                      The ticket goes to this address only. The buyer is still recorded but not emailed, so
                      remove the row afterwards.
                    </p>
                  </>
                )}
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}
              {formNotice && (
                <p className="text-xs text-[#3d3530] bg-[#eef5ef] border border-[#cfe3d4] rounded-xl px-3 py-2.5">
                  {formNotice}
                </p>
              )}
            </div>

            <div className="flex gap-2 px-5 pb-5">
              <button
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="flex-1 py-2.5 bg-white border border-[#e3e2de] text-[#6b5f58] text-xs tracking-[0.1em] uppercase rounded-full hover:border-[#3d3530] hover:text-[#3d3530] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-[#3d3530] text-white text-xs tracking-[0.1em] uppercase rounded-full hover:enabled:bg-[#2a2320] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Sending…' : form.testMode ? 'Send Test' : 'Send Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
