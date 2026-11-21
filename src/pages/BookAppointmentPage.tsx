import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useScrollPopupTrigger } from '../hooks/useScrollPopupTrigger'
import { useBookingState } from '../hooks/useBookingState'
import { useServices } from '../hooks/useServices'
import ClientEmailPopup from '../components/booking/ClientEmailPopup'
import ServiceMenu from '../components/booking/ServiceMenu'
import VideoModal from '../components/booking/VideoModal'
import InstagramReels from '../components/InstagramReels'
import SectionHeading from '../components/SectionHeading'
import VisitSection from '../components/booking/VisitSection'
import BookingDrawer from '../components/booking/BookingDrawer'
import BookingPausedModal from '../components/booking/BookingPausedModal'
const BOOKING_PAUSED = false

const REELS = [
  'v1785121052/b-reel-01_cx8hqx',
  'v1785121053/b-reel-02_kkjldv',
  'v1785121051/b-reel-03_w912vr',
  'v1785121051/b-reel-04_jv2fkk',
  'v1785121057/b-reel-05_vjqijw',
  'v1785121054/b-reel-06_whwosd',
  'v1785121055/b-reel-07_epzmkz',
  'v1785121055/b-reel-08_mnolkx',
]

export default function BookAppointmentPage() {
  useScrollAnimation()
  const b = useBookingState()
  const { services, ready } = useServices()
  const [searchParams] = useSearchParams()
  const appliedReschedule = useRef(false)
  const clientEmailPopup = useScrollPopupTrigger('mjp-booking-client-email-popup-dismissed')
  const [pausedOpen, setPausedOpen] = useState(BOOKING_PAUSED)

  useEffect(() => {
    if (BOOKING_PAUSED || appliedReschedule.current || !ready) return
    const tierLabels = searchParams.getAll('tier')
    const variationIds = searchParams.getAll('variation')
    const rescheduleToken = searchParams.get('rescheduleToken')
    if (tierLabels.length === 0) return

    const selections = tierLabels.flatMap((label, index) => {
      const variationId = variationIds[index]
      for (const service of services) {
        const tier = service.tiers.find((t) =>
          (variationId && t.squareVariationId === variationId) || t.label === label)
        if (tier) return [{ service, tier }]
      }
      return []
    })
    if (selections.length !== tierLabels.length) return

    appliedReschedule.current = true
    b.openDrawerWithItems(selections, rescheduleToken)
  }, [searchParams, services, ready, b])

  return (
    <>
      <ServiceMenu
        services={services}
        onVideoOpen={b.setVideoSrc}
        hideBar={b.drawerOpen}
        onBook={(service, tier) =>
          BOOKING_PAUSED ? setPausedOpen(true) : b.openDrawerWithItems([{ service, tier }])
        }
      />

      <InstagramReels
        reels={REELS}
        header={
          <SectionHeading
            id="work-heading"
            title="Micah's recent work"
            line="Real clients, fresh from the chair. Tap a reel to watch."
          />
        }
      />

      <VisitSection />

      {b.videoSrc && (
        <VideoModal src={b.videoSrc} onClose={() => b.setVideoSrc(null)} />
      )}

      {!BOOKING_PAUSED && clientEmailPopup.show && !b.drawerOpen && !b.videoSrc && (
        <ClientEmailPopup onClose={clientEmailPopup.dismiss} />
      )}

      {pausedOpen && <BookingPausedModal onClose={() => setPausedOpen(false)} />}

      <BookingDrawer
        open={b.drawerOpen}
        onClose={b.closeDrawer}
        step={b.step}
        bookingSuccess={b.bookingSuccess}
        items={b.items}
        totalMinutes={b.totalMinutes}
        selectedDate={b.selectedDate}
        selectedTime={b.selectedTime}
        selectedStartAt={b.selectedStartAt}
        services={services}
        draftService={b.draftService}
        draftTier={b.draftTier}
        editingItemId={b.editingItemId}
        slots={b.slots}
        slotsLoading={b.slotsLoading}
        slotsError={b.slotsError}
        availableDates={b.availableDates}
        datesLoading={b.datesLoading}
        confirmLoading={b.confirmLoading}
        locationId={b.locationId}
        firstName={b.firstName}
        lastName={b.lastName}
        email={b.email}
        phone={b.phone}
        cardConsent={b.cardConsent}
        policyConsent={b.policyConsent}
        honeypot={b.honeypot}
        onSelectService={b.handleSelectService}
        onSelectTier={b.handleSelectTier}
        onAddDraft={b.handleAddDraft}
        onCancelDraft={b.handleCancelDraft}
        onEditItem={b.handleEditItem}
        onRemoveItem={b.handleRemoveItem}
        onAddAnother={b.handleAddAnother}
        onSelectDate={b.handleSelectDate}
        onSelectSlot={b.handleSelectSlot}
        onMonthChange={b.handleMonthChange}
        onBack={b.handleBack}
        onContinue={b.handleContinue}
        onDetailsContinue={b.handleDetailsContinue}
        onConfirm={b.handleConfirm}
        onFirstNameChange={b.setFirstName}
        onLastNameChange={b.setLastName}
        onEmailChange={b.setEmail}
        onPhoneChange={b.setPhone}
        onCardConsentChange={b.setCardConsent}
        onPolicyConsentChange={b.setPolicyConsent}
        onHoneypotChange={b.setHoneypot}
      />
    </>
  )
}
