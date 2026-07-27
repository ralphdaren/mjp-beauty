import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useScrollPopupTrigger } from '../hooks/useScrollPopupTrigger'
import { useBookingState } from '../hooks/useBookingState'
import { useServices } from '../hooks/useServices'
import ClientEmailPopup from '../components/booking/ClientEmailPopup'
import ServiceRow from '../components/booking/ServiceRow'
import VideoModal from '../components/booking/VideoModal'
import InfoTabs from '../components/booking/InfoTabs'
import InstagramReels from '../components/InstagramReels'
import StudioLocation from '../components/booking/StudioLocation'
import BookingDrawer from '../components/booking/BookingDrawer'

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

  useEffect(() => {
    if (appliedReschedule.current || !ready) return
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
      {/* Page hero */}
      <div className="bg-[#f6f2ec] border-b border-[#e3e2de] py-14 text-center px-6">
        <p className="hero-eyebrow text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-3">MJP Beauty</p>
        <h1 className="hero-heading text-3xl font-semibold text-[#3d3530] mb-3">Our Services</h1>
        <p className="hero-tagline text-sm text-[#6b5f58] max-w-md mx-auto leading-relaxed">
          Choose your treatment below and book your appointment. All services are performed by
          Micah — a certified brow and lash artist.
        </p>
      </div>

      {/* Services list */}
      <main className="bg-[#fefefe] py-4 px-6 md:px-10 lg:px-16">
        <div className="max-w-5xl mx-auto divide-y divide-[#e3e2de]">
          {services.map((service, index) => (
            <ServiceRow
              key={service.id}
              service={service}
              index={index}
              onVideoOpen={b.setVideoSrc}
              onBook={b.openDrawerForService}
            />
          ))}
        </div>
      </main>

      <InstagramReels reels={REELS} />

      <StudioLocation />

      <InfoTabs />

      {b.videoSrc && (
        <VideoModal src={b.videoSrc} onClose={() => b.setVideoSrc(null)} />
      )}

      {/* Held back while the drawer or a video is open — both sit at z-50 too */}
      {clientEmailPopup.show && !b.drawerOpen && !b.videoSrc && (
        <ClientEmailPopup onClose={clientEmailPopup.dismiss} />
      )}

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
