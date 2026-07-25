import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { BookingItem, Service, PriceTier, Slot, DrawerStep } from '../../../types/booking'
import StepIndicator from './StepIndicator'
import DrawerSuccess from './DrawerSuccess'
import DrawerServices from './DrawerServices'
import DrawerOptions from './DrawerOptions'
import DrawerSummary from './DrawerSummary'
import DrawerDateTime from './DrawerDateTime'
import DrawerDetails from './DrawerDetails'
import DrawerConfirm from './DrawerConfirm'

export interface BookingDrawerProps {
  open: boolean
  onClose: () => void
  step: DrawerStep
  bookingSuccess: boolean
  // The appointment being built
  items: BookingItem[]
  totalMinutes: number
  selectedDate: string | null
  selectedTime: string | null
  selectedStartAt: string | null
  // Step 1 — service list + option picker
  services: Service[]
  draftService: Service | null
  draftTier: PriceTier | null
  editingItemId: string | null
  onSelectService: (s: Service) => void
  onSelectTier: (t: PriceTier) => void
  onAddDraft: () => void
  onCancelDraft: () => void
  // Step 2 — summary
  onEditItem: (id: string) => void
  onRemoveItem: (id: string) => void
  onAddAnother: () => void
  // Step 3 — date & time
  slots: Slot[] | null
  slotsLoading: boolean
  slotsError: string | null
  availableDates: Set<string>
  datesLoading: boolean
  onSelectDate: (d: string) => void
  onSelectSlot: (slot: Slot) => void
  onMonthChange: (year: number, month: number) => void
  onBack: () => void
  onContinue: () => void
  // Step 4 — details
  firstName: string
  lastName: string
  email: string
  phone: string
  cardConsent: boolean
  policyConsent: boolean
  honeypot: string
  locationId: string | null
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onEmailChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onCardConsentChange: (v: boolean) => void
  onPolicyConsentChange: (v: boolean) => void
  onHoneypotChange: (v: string) => void
  onDetailsContinue: (sourceId: string) => void
  // Step 5 — confirm
  confirmLoading: boolean
  onConfirm: () => void
}

export default function BookingDrawer({
  open,
  onClose,
  step,
  bookingSuccess,
  items,
  totalMinutes,
  selectedDate,
  selectedTime,
  selectedStartAt,
  services,
  draftService,
  draftTier,
  editingItemId,
  onSelectService,
  onSelectTier,
  onAddDraft,
  onCancelDraft,
  onEditItem,
  onRemoveItem,
  onAddAnother,
  slots,
  slotsLoading,
  slotsError,
  availableDates,
  datesLoading,
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
  honeypot,
  locationId,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onCardConsentChange,
  onPolicyConsentChange,
  onHoneypotChange,
  onDetailsContinue,
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
            firstName={firstName}
            items={items}
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
              {/* Step 1 picks one service at a time: the list, then its options. */}
              {step === 1 && !draftService && (
                <DrawerServices
                  services={services}
                  bookedCount={items.length}
                  onSelectService={onSelectService}
                  onBack={onCancelDraft}
                />
              )}

              {step === 1 && draftService && (
                <DrawerOptions
                  service={draftService}
                  selectedTier={draftTier}
                  isEditing={editingItemId !== null}
                  onSelectTier={onSelectTier}
                  onBack={onCancelDraft}
                  onAdd={onAddDraft}
                />
              )}

              {step === 2 && items.length > 0 && (
                <DrawerSummary
                  items={items}
                  onEditItem={onEditItem}
                  onRemoveItem={onRemoveItem}
                  onAddAnother={onAddAnother}
                  onBack={onBack}
                  onContinue={onContinue}
                />
              )}

              {step === 3 && items.length > 0 && (
                <DrawerDateTime
                  items={items}
                  totalMinutes={totalMinutes}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  slots={slots}
                  slotsLoading={slotsLoading}
                  slotsError={slotsError}
                  availableDates={availableDates}
                  datesLoading={datesLoading}
                  onSelectDate={onSelectDate}
                  onSelectSlot={onSelectSlot}
                  onMonthChange={onMonthChange}
                  onBack={onBack}
                  onContinue={onContinue}
                />
              )}

              {step === 4 && (
                <DrawerDetails
                  step={step}
                  open={open}
                  locationId={locationId}
                  selectedStartAt={selectedStartAt}
                  items={items}
                  firstName={firstName}
                  lastName={lastName}
                  email={email}
                  phone={phone}
                  cardConsent={cardConsent}
                  policyConsent={policyConsent}
                  honeypot={honeypot}
                  onFirstNameChange={onFirstNameChange}
                  onLastNameChange={onLastNameChange}
                  onEmailChange={onEmailChange}
                  onPhoneChange={onPhoneChange}
                  onCardConsentChange={onCardConsentChange}
                  onPolicyConsentChange={onPolicyConsentChange}
                  onHoneypotChange={onHoneypotChange}
                  onBack={onBack}
                  onDetailsContinue={onDetailsContinue}
                />
              )}

              {step === 5 && items.length > 0 && selectedDate && selectedTime && (
                <DrawerConfirm
                  items={items}
                  totalMinutes={totalMinutes}
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
