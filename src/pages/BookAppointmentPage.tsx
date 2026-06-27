import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useBookingState } from '../hooks/useBookingState'
import { SERVICES } from '../data/booking'
import ServiceRow from '../components/booking/ServiceRow'
import VideoModal from '../components/booking/VideoModal'
import InfoTabs from '../components/booking/InfoTabs'
import InstagramReels from '../components/booking/InstagramReels'
import StudioLocation from '../components/booking/StudioLocation'
import BookingDrawer from '../components/booking/BookingDrawer'

export default function BookAppointmentPage() {
  useScrollAnimation()
  const b = useBookingState()

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
          {SERVICES.map((service, index) => (
            <ServiceRow
              key={service.id}
              service={service}
              index={index}
              onVideoOpen={b.setVideoSrc}
              onBook={b.openDrawer}
            />
          ))}
        </div>
      </main>

      <InstagramReels />

      <StudioLocation />

      <InfoTabs />

      {b.videoSrc && (
        <VideoModal src={b.videoSrc} onClose={() => b.setVideoSrc(null)} />
      )}

      <BookingDrawer
        open={b.drawerOpen}
        onClose={b.closeDrawer}
        step={b.step}
        bookingSuccess={b.bookingSuccess}
        selectedService={b.selectedService}
        selectedTier={b.selectedTier}
        selectedDate={b.selectedDate}
        selectedTime={b.selectedTime}
        selectedStartAt={b.selectedStartAt}
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
        onSelectService={b.handleSelectService}
        onSelectTier={b.handleSelectTier}
        onSelectDate={b.handleSelectDate}
        onSelectSlot={b.handleSelectSlot}
        onMonthChange={b.handleMonthChange}
        onBack={b.handleBack}
        onContinue={b.handleContinue}
        onStep3Continue={b.handleStep3Continue}
        onConfirm={b.handleConfirm}
        onFirstNameChange={b.setFirstName}
        onLastNameChange={b.setLastName}
        onEmailChange={b.setEmail}
        onPhoneChange={b.setPhone}
        onCardConsentChange={b.setCardConsent}
        onPolicyConsentChange={b.setPolicyConsent}
      />
    </>
  )
}
