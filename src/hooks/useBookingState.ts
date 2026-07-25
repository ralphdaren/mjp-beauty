import { useState, useEffect, useMemo } from 'react'
import type { BookingItem, Service, PriceTier, Slot, DrawerStep } from '../types/booking'
import { MAX_SERVICES_PER_BOOKING } from '../types/booking'
import { tierMinutes } from '../lib/catalog'

// Every service in the appointment, in the order Square will run them. Both keys
// are sent per service and stay positionally paired: the id is what Square is
// really asked about, the label only covers a tier the catalog hasn't given an
// id to yet.
function availabilityQuery(items: BookingItem[]): string {
  return items
    .map((item) =>
      `tierLabel=${encodeURIComponent(item.tier.label)}` +
      `&variationId=${encodeURIComponent(item.tier.squareVariationId ?? '')}`,
    )
    .join('&')
}

function newItemId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useBookingState() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [step, setStep] = useState<DrawerStep>(1)

  // The appointment being built — one entry per service, booked back to back.
  const [items, setItems] = useState<BookingItem[]>([])

  // The service/option pair the customer is picking right now on step 1. It only
  // joins `items` once they add it, so backing out of the picker changes nothing.
  const [draftService, setDraftService] = useState<Service | null>(null)
  const [draftTier, setDraftTier] = useState<PriceTier | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  // Time selection
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null)
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<(string | null)[]>([])
  const [rescheduleToken, setRescheduleToken] = useState<string | null>(null)

  // Availability
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [datesLoading, setDatesLoading] = useState(false)

  // Booking
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [cardSourceId, setCardSourceId] = useState<string | null>(null)

  // Square SDK
  const [locationId, setLocationId] = useState<string | null>(null)

  // Customer form
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cardConsent, setCardConsent] = useState(false)
  const [policyConsent, setPolicyConsent] = useState(false)

  // Honeypot — hidden field real users never fill in; bots that auto-fill every
  // input on the page do. Non-empty means the submission is bot traffic.
  const [honeypot, setHoneypot] = useState('')

  // Availability is searched for the whole basket at once, so every effect below
  // re-runs when a service is added, removed or swapped — not on identity churn.
  const basketKey = useMemo(
    () => items.map((item) => item.tier.squareVariationId ?? item.tier.label).join('|'),
    [items],
  )

  // Fetch Square location ID once on mount
  useEffect(() => {
    fetch('/api/locations/id')
      .then((r) => r.json())
      .then((d) => setLocationId(d.locationId ?? null))
      .catch(() => {})
  }, [])

  // Fetch available dates when the basket changes
  useEffect(() => {
    if (items.length === 0) { setAvailableDates(new Set()); return }
    const now = new Date()
    fetchAvailableDates(items, now.getFullYear(), now.getMonth())
  }, [basketKey])

  // Fetch time slots when the basket or date changes
  useEffect(() => {
    if (items.length === 0 || !selectedDate) { setSlots(null); return }
    setSlotsLoading(true)
    setSlotsError(null)
    fetch(`/api/bookings/availability?${availabilityQuery(items)}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setSlotsError(data.error)
        else setSlots(data.slots ?? [])
      })
      .catch((err) => setSlotsError(String(err)))
      .finally(() => setSlotsLoading(false))
  }, [basketKey, selectedDate])

  function fetchAvailableDates(forItems: BookingItem[], year: number, month: number) {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    setDatesLoading(true)
    fetch(`/api/bookings/availability?${availabilityQuery(forItems)}&month=${monthStr}`)
      .then((r) => r.json())
      .then((data) => setAvailableDates(new Set<string>(data.dates ?? [])))
      .catch(() => setAvailableDates(new Set()))
      .finally(() => setDatesLoading(false))
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  // Changing what's booked changes how long the appointment runs, so any slot
  // already picked no longer means anything.
  function clearTimeSelection() {
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedStartAt(null)
    setSelectedTeamMemberIds([])
    setSlots(null)
    setSlotsError(null)
  }

  function clearDraft() {
    setDraftService(null)
    setDraftTier(null)
    setEditingItemId(null)
  }

  function handleSelectService(service: Service) {
    setDraftService(service)
    setDraftTier(null)
  }

  function handleSelectTier(tier: PriceTier) {
    setDraftTier(tier)
  }

  // Commits the step 1 picker into the appointment — as a new service, or as a
  // replacement when the customer came in through a summary pencil.
  function handleAddDraft() {
    if (!draftService || !draftTier) return
    const service = draftService
    const tier = draftTier
    setItems((prev) => {
      if (editingItemId) {
        return prev.map((item) => (item.id === editingItemId ? { ...item, service, tier } : item))
      }
      if (prev.length >= MAX_SERVICES_PER_BOOKING) return prev
      return [...prev, { id: newItemId(), service, tier }]
    })
    clearDraft()
    clearTimeSelection()
    setStep(2)
  }

  // Back out of the option picker without touching the appointment.
  function handleCancelDraft() {
    clearDraft()
    if (items.length > 0) setStep(2)
  }

  function handleEditItem(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item) return
    setDraftService(item.service)
    setDraftTier(item.tier)
    setEditingItemId(id)
    setStep(1)
  }

  function handleRemoveItem(id: string) {
    const remaining = items.filter((item) => item.id !== id)
    setItems(remaining)
    clearTimeSelection()
    if (remaining.length === 0) {
      clearDraft()
      setStep(1)
    }
  }

  function handleAddAnother() {
    clearDraft()
    setStep(1)
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setSelectedTime(null)
    setSelectedStartAt(null)
    setSelectedTeamMemberIds([])
  }

  function handleSelectSlot(slot: Slot) {
    setSelectedTime(slot.time)
    setSelectedStartAt(slot.startAt)
    setSelectedTeamMemberIds(slot.teamMemberIds ?? [slot.teamMemberId])
  }

  function handleMonthChange(year: number, month: number) {
    if (items.length > 0) fetchAvailableDates(items, year, month)
  }

  function handleBack() {
    setStep((s) => {
      if (s === 5) setCardSourceId(null)
      // Step 1 is the service list; leaving the summary means starting a new pick.
      if (s === 2) clearDraft()
      return Math.max(1, s - 1) as DrawerStep
    })
  }

  function handleContinue() {
    setStep((s) => Math.min(5, s + 1) as DrawerStep)
  }

  function handleDetailsContinue(sourceId: string) {
    setCardSourceId(sourceId)
    setStep(5)
  }

  async function handleConfirm() {
    if (items.length === 0 || !selectedStartAt || !cardSourceId) return

    // Bot filled the hidden honeypot field — pretend success without touching
    // Square/Supabase/Resend at all.
    if (honeypot.trim() !== '') {
      setBookingSuccess(true)
      return
    }

    setConfirmLoading(true)
    try {
      const cardRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'attach-card', firstName, lastName, email, phone, sourceId: cardSourceId }),
      })
      const cardData = await cardRes.json()
      if (!cardRes.ok) throw new Error(cardData.error ?? 'Failed to save card')
      const customerId: string = cardData.customerId

      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item, index) => ({
            serviceName: item.service.name,
            variationId: item.tier.squareVariationId ?? null,
            tierLabel: item.tier.label,
            teamMemberId: selectedTeamMemberIds[index] ?? null,
          })),
          startAt: selectedStartAt,
          customerId,
          firstName,
          lastName,
          email,
          phone,
          honeypot,
        }),
      })
      const bookingData = await bookingRes.json()
      if (!bookingRes.ok) throw new Error(bookingData.error ?? 'Booking failed')

      // This is a reschedule — the old request is only cancelled now that the
      // replacement booking has actually gone through. Fire-and-forget: the
      // new booking already succeeded, so don't block success on this.
      if (rescheduleToken) {
        fetch('/api/bookings/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: rescheduleToken, action: 'cancel' }),
        }).catch(() => {})
      }

      setBookingSuccess(true)
    } catch (err) {
      alert(String(err))
    } finally {
      setConfirmLoading(false)
    }
  }

  // Clears the previous booking so a reopened drawer never inherits its
  // selections, card or form values. Shared by every entry point below.
  function resetBooking() {
    setItems([])
    clearDraft()
    clearTimeSelection()
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setCardConsent(false)
    setPolicyConsent(false)
    setCardSourceId(null)
    setBookingSuccess(false)
  }

  function openDrawer() {
    resetBooking()
    setRescheduleToken(null)
    setStep(1)
    setDrawerOpen(true)
  }

  // "Book Now" on a service row — opens the option picker for that service, so
  // the client only has to choose an option to get their first item added.
  function openDrawerForService(service: Service) {
    resetBooking()
    setDraftService(service)
    setRescheduleToken(null)
    setStep(1)
    setDrawerOpen(true)
  }

  // Reschedule: the same services are already chosen, so land straight on the
  // date & time step with the basket pre-filled.
  function openDrawerWithItems(
    selections: Array<{ service: Service; tier: PriceTier }>,
    forRescheduleToken: string | null = null,
  ) {
    if (selections.length === 0) return
    resetBooking()
    setItems(selections.map((s) => ({ id: newItemId(), service: s.service, tier: s.tier })))
    setRescheduleToken(forRescheduleToken)
    setStep(3)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  const totalMinutes = items.reduce((sum, item) => sum + tierMinutes(item.tier), 0)

  return {
    // Video
    videoSrc,
    setVideoSrc,
    // Drawer
    drawerOpen,
    openDrawer,
    openDrawerForService,
    openDrawerWithItems,
    closeDrawer,
    step,
    bookingSuccess,
    // Appointment
    items,
    totalMinutes,
    draftService,
    draftTier,
    editingItemId,
    // Time selection
    selectedDate,
    selectedTime,
    selectedStartAt,
    // Availability
    slots,
    slotsLoading,
    slotsError,
    availableDates,
    datesLoading,
    // Booking
    confirmLoading,
    // Square
    locationId,
    // Customer form
    firstName,
    lastName,
    email,
    phone,
    cardConsent,
    policyConsent,
    honeypot,
    // Handlers
    handleSelectService,
    handleSelectTier,
    handleAddDraft,
    handleCancelDraft,
    handleEditItem,
    handleRemoveItem,
    handleAddAnother,
    handleSelectDate,
    handleSelectSlot,
    handleMonthChange,
    handleBack,
    handleContinue,
    handleDetailsContinue,
    handleConfirm,
    setFirstName,
    setLastName,
    setEmail,
    setPhone,
    setCardConsent,
    setPolicyConsent,
    setHoneypot,
  }
}
