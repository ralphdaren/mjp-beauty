import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Service, PriceTier, Slot, DrawerStep } from '../../../types/booking'
import StepIndicator from './StepIndicator'
import DrawerSuccess from './DrawerSuccess'
import DrawerStep1 from './DrawerStep1'
import DrawerStep2 from './DrawerStep2'
import DrawerStep3 from './DrawerStep3'
import DrawerStep4 from './DrawerStep4'

export interface BookingDrawerProps {
  open: boolean
  onClose: () => void
  step: DrawerStep
  bookingSuccess: boolean
  selectedService: Service | null
  selectedTier: PriceTier | null
  selectedDate: string | null
  selectedTime: string | null
  // Step 2
  slots: Slot[] | null
  slotsLoading: boolean
  slotsError: string | null
  availableDates: Set<string>
  datesLoading: boolean
  onSelectService: (s: Service) => void
  onSelectTier: (t: PriceTier) => void
  onSelectDate: (d: string) => void
  onSelectSlot: (slot: Slot) => void
  onMonthChange: (year: number, month: number) => void
  onBack: () => void
  onContinue: () => void
  // Step 3
  firstName: string
  lastName: string
  email: string
  phone: string
  cardConsent: boolean
  policyConsent: boolean
  locationId: string | null
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onCardConsentChange: (v: boolean) => void
  onPolicyConsentChange: (v: boolean) => void
  onStep3Continue: (sourceId: string) => void
  // Step 4
  confirmLoading: boolean
  onConfirm: () => void
}

export default function BookingDrawer({
  open,
  onClose,
  step,
  bookingSuccess,
  selectedService,
  selectedTier,
  selectedDate,
  selectedTime,
  slots,
  slotsLoading,
  slotsError,
  availableDates,
  datesLoading,
  onSelectService,
  onSelectTier,
  onSelectDate,
  onSelectSlot,
  onMonthChange,
  onBack,
  onContinue,
  firstName,
  lastName,
  email,
  phone,
  cardConsent,
  policyConsent,
  locationId,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onCardConsentChange,
  onPolicyConsentChange,
  onStep3Continue,
  confirmLoading,
  onConfirm,
}: BookingDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {bookingSuccess ? (
          <DrawerSuccess
            selectedService={selectedService}
            selectedTier={selectedTier}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onClose={onClose}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e3e2de] shrink-0">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a]">MJP Beauty</p>
                <h2 className="text-lg font-semibold text-[#3d3530]">Book an Appointment</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#f0ece6] text-[#827064] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <StepIndicator step={step} />

            {/* Scrollable step content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8">
              {step === 1 && (
                <DrawerStep1 onSelectService={onSelectService} />
              )}

              {step === 2 && selectedService && (
                <DrawerStep2
                  selectedService={selectedService}
                  selectedTier={selectedTier}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  slots={slots}
                  slotsLoading={slotsLoading}
                  slotsError={slotsError}
                  availableDates={availableDates}
                  datesLoading={datesLoading}
                  onSelectTier={onSelectTier}
                  onSelectDate={onSelectDate}
                  onSelectSlot={onSelectSlot}
                  onMonthChange={onMonthChange}
                  onBack={onBack}
                  onContinue={onContinue}
                />
              )}

              {step === 3 && (
                <DrawerStep3
                  step={step}
                  open={open}
                  locationId={locationId}
                  firstName={firstName}
                  lastName={lastName}
                  email={email}
                  phone={phone}
                  cardConsent={cardConsent}
                  policyConsent={policyConsent}
                  onFirstNameChange={onFirstNameChange}
                  onLastNameChange={onLastNameChange}
                  onEmailChange={onEmailChange}
                  onPhoneChange={onPhoneChange}
                  onCardConsentChange={onCardConsentChange}
                  onPolicyConsentChange={onPolicyConsentChange}
                  onBack={onBack}
                  onStep3Continue={onStep3Continue}
                />
              )}

              {step === 4 && selectedService && selectedTier && selectedDate && selectedTime && (
                <DrawerStep4
                  selectedService={selectedService}
                  selectedTier={selectedTier}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  confirmLoading={confirmLoading}
                  onBack={onBack}
                  onConfirm={onConfirm}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
