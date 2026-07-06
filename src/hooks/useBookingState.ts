import { useState, useEffect } from 'react'
import type { Service, PriceTier, Slot, DrawerStep } from '../types/booking'

export function useBookingState() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [step, setStep] = useState<DrawerStep>(1)

  // Selection state
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null)
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null)

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

  // Fetch Square location ID once on mount
  useEffect(() => {
    fetch('/api/locations/id')
      .then((r) => r.json())
      .then((d) => setLocationId(d.locationId ?? null))
      .catch(() => {})
  }, [])

  // Fetch available dates when tier changes
  useEffect(() => {
    if (!selectedTier) { setAvailableDates(new Set()); return }
    const now = new Date()
    fetchAvailableDates(selectedTier, now.getFullYear(), now.getMonth())
  }, [selectedTier?.label])

  // Fetch time slots when tier + date change
  useEffect(() => {
    if (!selectedTier || !selectedDate) { setSlots(null); return }
    setSlotsLoading(true)
    setSlotsError(null)
    const label = encodeURIComponent(selectedTier.squareVariationName ?? selectedTier.label)
    fetch(`/api/bookings/availability?tierLabel=${label}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setSlotsError(data.error)
        else setSlots(data.slots ?? [])
      })
      .catch((err) => setSlotsError(String(err)))
      .finally(() => setSlotsLoading(false))
  }, [selectedTier?.label, selectedDate])

  function fetchAvailableDates(tier: PriceTier, year: number, month: number) {
    const label    = encodeURIComponent(tier.squareVariationName ?? tier.label)
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    setDatesLoading(true)
    fetch(`/api/bookings/availability?tierLabel=${label}&month=${monthStr}`)
      .then((r) => r.json())
      .then((data) => setAvailableDates(new Set<string>(data.dates ?? [])))
      .catch(() => setAvailableDates(new Set()))
      .finally(() => setDatesLoading(false))
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleSelectService(service: Service) {
    setSelectedService(service)
    setSelectedTier(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedStartAt(null)
    setSelectedTeamMemberId(null)
    setSlots(null)
    setStep(2)
  }

  function handleSelectTier(tier: PriceTier) {
    setSelectedTier(tier)
    setSelectedTime(null)
    setSelectedStartAt(null)
    setSelectedTeamMemberId(null)
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setSelectedTime(null)
    setSelectedStartAt(null)
    setSelectedTeamMemberId(null)
  }

  function handleSelectSlot(slot: Slot) {
    setSelectedTime(slot.time)
    setSelectedStartAt(slot.startAt)
    setSelectedTeamMemberId(slot.teamMemberId)
  }

  function handleMonthChange(year: number, month: number) {
    if (selectedTier) fetchAvailableDates(selectedTier, year, month)
  }

  function handleBack() {
    setStep((s) => {
      const prev = Math.max(1, s - 1) as DrawerStep
      if (s === 4) setCardSourceId(null)
      return prev
    })
  }

  function handleContinue() {
    setStep((s) => Math.min(4, s + 1) as DrawerStep)
  }

  function handleStep3Continue(sourceId: string) {
    setCardSourceId(sourceId)
    setStep(4)
  }

  async function handleConfirm() {
    if (!selectedService || !selectedTier || !selectedStartAt || !cardSourceId) return

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

      const squareTierLabel = selectedTier.squareVariationName ?? selectedTier.label
      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierLabel: squareTierLabel,
          startAt: selectedStartAt,
          teamMemberId: selectedTeamMemberId,
          customerId,
          serviceName: selectedService.name,
          firstName,
          lastName,
          email,
          phone,
          honeypot,
        }),
      })
      const bookingData = await bookingRes.json()
      if (!bookingRes.ok) throw new Error(bookingData.error ?? 'Booking failed')

      setBookingSuccess(true)
    } catch (err) {
      alert(String(err))
    } finally {
      setConfirmLoading(false)
    }
  }

  function openDrawer() {
    setStep(1)
    setSelectedService(null)
    setSelectedTier(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedStartAt(null)
    setSelectedTeamMemberId(null)
    setSlots(null)
    setSlotsError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setCardConsent(false)
    setPolicyConsent(false)
    setCardSourceId(null)
    setBookingSuccess(false)
    setDrawerOpen(true)
  }

  function openDrawerWithSelection(service: Service, tier: PriceTier) {
    setStep(2)
    setSelectedService(service)
    setSelectedTier(tier)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedStartAt(null)
    setSelectedTeamMemberId(null)
    setSlots(null)
    setSlotsError(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setCardConsent(false)
    setPolicyConsent(false)
    setCardSourceId(null)
    setBookingSuccess(false)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  return {
    // Video
    videoSrc,
    setVideoSrc,
    // Drawer
    drawerOpen,
    openDrawer,
    openDrawerWithSelection,
    closeDrawer,
    step,
    bookingSuccess,
    // Selection
    selectedService,
    selectedTier,
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
    handleSelectDate,
    handleSelectSlot,
    handleMonthChange,
    handleBack,
    handleContinue,
    handleStep3Continue,
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
