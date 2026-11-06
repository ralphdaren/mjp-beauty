import { useEffect, useState } from 'react'
import type { Refetch } from './adminShell'

export interface BookingRequest {
  id: string
  created_at: string
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  first_name: string
  last_name: string
  email: string
  phone: string | null
  service_name: string
  tier_label: string
  items: Array<{ serviceName: string; tierLabel: string }> | null
  duration_minutes: number | null
  start_at: string
  reviewed_at: string | null
  square_booking_id: string | null
  square_customer_id: string | null
  square_no_show: boolean
  fee_status: 'charging' | 'charged' | null
  fee_reason: string | null
  fee_amount_cents: number | null
  fee_charged_at: string | null
  fee_claimed_at?: string | null
}

export type RequestStatus = BookingRequest['status']

export interface RequestService {
  serviceName: string
  tierLabel: string
}

export function requestServices(r: BookingRequest): RequestService[] {
  return r.items?.length ? r.items : [{ serviceName: r.service_name, tierLabel: r.tier_label }]
}

export const FEE_REASON_LABELS: Record<string, string> = {
  late: 'Late cancellation',
  same_day: 'Same-day cancellation',
  no_show: 'No-show',
  late_arrival: 'Late arrival',
}

const CLAIM_STALE_MS = 5 * 60 * 1000

/** True while a charge is genuinely in flight (a claim older than 5 minutes is treated as abandoned). */
export function isFeeInProgress(r: BookingRequest, nowMs: number): boolean {
  if (r.fee_status !== 'charging') return false
  const claimed = r.fee_claimed_at ? Date.parse(r.fee_claimed_at) : NaN
  if (Number.isNaN(claimed)) return false
  return nowMs - claimed <= CLAIM_STALE_MS
}

/** A 'charging' claim older than 5 minutes (or with no claim time): the last attempt's outcome was never confirmed. */
export function isFeeClaimStale(r: BookingRequest, nowMs: number): boolean {
  return r.fee_status === 'charging' && !isFeeInProgress(r, nowMs)
}

export const STALE_CLAIM_WARNING = 'Previous attempt unconfirmed. Check Square first.'

/** Eligibility except the card requirement: used to tell "No card on file" from "not eligible". */
export function feeEligibleIgnoringCard(r: BookingRequest, nowMs: number): boolean {
  if (!r.square_booking_id) return false
  if (r.fee_status === 'charged') return false
  if (r.fee_status === 'charging' && isFeeInProgress(r, nowMs)) return false
  if (r.status === 'cancelled') return true
  return r.status === 'accepted' && Date.parse(r.start_at) < nowMs
}

/** Button visibility only. Mirrors api/_fee.ts isChargeable; the server is the authority. */
export function canChargeFee(r: BookingRequest, nowMs: number): boolean {
  return !!r.square_customer_id && feeEligibleIgnoringCard(r, nowMs)
}

const PAGE_SIZE = 10

interface UseServiceRequestsArgs {
  token: string
  requests: BookingRequest[]
  onRefetch: Refetch
}

export function useServiceRequests({ token, requests, onRefetch }: UseServiceRequestsArgs) {
  const [tab, setTab] = useState<RequestStatus>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [optionFilter, setOptionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [now, setNow] = useState(() => Date.now())
  const [feeTarget, setFeeTarget] = useState<BookingRequest | null>(null)

  useEffect(() => {
    setPage(1)
    setExpanded(new Set())
  }, [tab, search, dateFrom, dateTo, serviceFilter, optionFilter])

  // Keeps fee eligibility (upcoming -> passed, stale claims) current without a refetch.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAction(requestId: string, action: 'accept' | 'decline') {
    setActionLoading(requestId)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, requestId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Failed to ${action}`)
      await onRefetch({ silent: true })
    } catch (err) {
      alert(String(err))
    } finally {
      setActionLoading(null)
    }
  }

  function clearFilters() {
    setDateFrom('')
    setDateTo('')
    setServiceFilter('')
    setOptionFilter('')
  }

  const q = search.trim().toLowerCase()
  const filtered = requests.filter((r) => {
    if (r.status !== tab) return false
    if (q && !`${r.first_name} ${r.last_name}`.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) {
      return false
    }
    const services = requestServices(r)
    if (serviceFilter && !services.some((i) => i.serviceName === serviceFilter)) return false
    if (optionFilter && !services.some((i) => i.tierLabel === optionFilter)) return false
    const day = r.start_at.slice(0, 10)
    if (dateFrom && day < dateFrom) return false
    if (dateTo && day > dateTo) return false
    return true
  })

  const serviceOptions = [...new Set(requests.flatMap((r) => requestServices(r).map((i) => i.serviceName)))].sort()
  const optionOptions = [...new Set(requests.flatMap((r) => requestServices(r).map((i) => i.tierLabel)))].sort()

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  return {
    tab,
    setTab,
    tabCount: (t: RequestStatus) => requests.filter((r) => r.status === t).length,

    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    serviceFilter,
    setServiceFilter,
    optionFilter,
    setOptionFilter,
    serviceOptions,
    optionOptions,
    hasActiveFilters: !!(dateFrom || dateTo || serviceFilter || optionFilter),
    clearFilters,

    filtered,
    pageItems: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    page,
    setPage,
    totalPages,

    expanded,
    toggleExpanded,
    actionLoading,
    handleAction,

    token,
    onRefetch,
    now,
    feeTarget,
    openFee: setFeeTarget,
    closeFee: () => setFeeTarget(null),
  }
}

export type ServiceRequestsController = ReturnType<typeof useServiceRequests>
