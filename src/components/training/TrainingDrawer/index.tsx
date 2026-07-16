import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { TrainingDate } from '../../../lib/training'
import type { TrainingOption, TrainingDrawerStep, DepositPaymentMethod } from '../../../types/training'
import type { TrainingDetails } from '../../../hooks/useTrainingBookingState'
import StepIndicator from './StepIndicator'
import DrawerStep1 from './DrawerStep1'
import DrawerStep2 from './DrawerStep2'
import DrawerStep3 from './DrawerStep3'
import DrawerStep4 from './DrawerStep4'
import DrawerSuccess from './DrawerSuccess'

export interface TrainingDrawerProps {
  open: boolean
  onClose: () => void
  step: TrainingDrawerStep
  selectedOption: TrainingOption | null
  // Step 1
  trainingDates: TrainingDate[]
  datesLoading: boolean
  selectedDate: TrainingDate | null
  onSelectDate: (date: TrainingDate) => void
  // Step 2
  paymentMethod: DepositPaymentMethod | null
  onSelectPaymentMethod: (method: DepositPaymentMethod) => void
  // Step 3
  details: TrainingDetails
  onUpdateDetails: (patch: Partial<TrainingDetails>) => void
  honeypot: string
  onHoneypotChange: (v: string) => void
  // Step 4 / submit
  submitting: boolean
  submitError: string
  submitted: boolean
  onSubmit: () => void
  onBack: () => void
  onContinue: () => void
}

export default function TrainingDrawer({
  open,
  onClose,
  step,
  selectedOption,
  trainingDates,
  datesLoading,
  selectedDate,
  onSelectDate,
  paymentMethod,
  onSelectPaymentMethod,
  details,
  onUpdateDetails,
  honeypot,
  onHoneypotChange,
  submitting,
  submitError,
  submitted,
  onSubmit,
  onBack,
  onContinue,
}: TrainingDrawerProps) {
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e3e2de] shrink-0">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a]">MJP Beauty</p>
            <h2 className="text-lg font-semibold text-[#3d3530]">
              {selectedOption ? `Book ${selectedOption.title} Training` : 'Book In-Person Training'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#f0ece6] text-[#827064] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <DrawerSuccess
            firstName={details.firstName}
            selectedOption={selectedOption}
            selectedDate={selectedDate}
            onClose={onClose}
          />
        ) : (
          <>
            <StepIndicator step={step} />

            {/* Scrollable step content */}
            <div className="flex-1 overflow-y-auto px-6 pb-8">
              {step === 1 && selectedOption && (
                <DrawerStep1
                  selectedOption={selectedOption}
                  trainingDates={trainingDates}
                  datesLoading={datesLoading}
                  selectedDate={selectedDate}
                  onSelectDate={onSelectDate}
                  onContinue={onContinue}
                />
              )}

              {step === 2 && (
                <DrawerStep2
                  paymentMethod={paymentMethod}
                  onSelectPaymentMethod={onSelectPaymentMethod}
                  onBack={onBack}
                  onContinue={onContinue}
                />
              )}

              {step === 3 && (
                <DrawerStep3
                  details={details}
                  onUpdateDetails={onUpdateDetails}
                  honeypot={honeypot}
                  onHoneypotChange={onHoneypotChange}
                  onBack={onBack}
                  onContinue={onContinue}
                />
              )}

              {step === 4 && selectedOption && (
                <DrawerStep4
                  selectedOption={selectedOption}
                  selectedDate={selectedDate}
                  paymentMethod={paymentMethod}
                  details={details}
                  submitting={submitting}
                  submitError={submitError}
                  onBack={onBack}
                  onSubmit={onSubmit}
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
