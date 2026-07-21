import { useState, useEffect } from 'react'
import { getTrainingDates, createTrainingHold, type TrainingDate } from '../lib/training'
import type { TrainingOption, TrainingDrawerStep, DepositPaymentMethod } from '../types/training'

export interface TrainingDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  /** Where the student lives — surfaced in the admin dashboard so Micah can
   *  confirm the students local to each training city. */
  city: string
  /** Two-letter province/territory code, e.g. 'MB'. */
  province: string
}

const EMPTY_DETAILS: TrainingDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  province: '',
}

export function useTrainingBookingState() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [step, setStep] = useState<TrainingDrawerStep>(1)
  const [selectedOption, setSelectedOption] = useState<TrainingOption | null>(null)

  const [trainingDates, setTrainingDates] = useState<TrainingDate[]>([])
  const [datesLoading, setDatesLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<TrainingDate | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<DepositPaymentMethod | null>(null)
  const [details, setDetails] = useState<TrainingDetails>(EMPTY_DETAILS)
  const [honeypot, setHoneypot] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Fetch available dates from the API whenever the selected training option changes
  useEffect(() => {
    if (!selectedOption) { setTrainingDates([]); return }
    setDatesLoading(true)
    getTrainingDates(selectedOption.id)
      .then(setTrainingDates)
      .finally(() => setDatesLoading(false))
  }, [selectedOption?.id])

  function openDrawer(option: TrainingOption) {
    setSelectedOption(option)
    setSelectedDate(null)
    setPaymentMethod(null)
    setDetails(EMPTY_DETAILS)
    setHoneypot('')
    setSubmitError('')
    setSubmitted(false)
    setStep(1)
    setDrawerOpen(true)
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  function handleSelectDate(date: TrainingDate) {
    setSelectedDate(date)
  }

  function handleSelectPaymentMethod(method: DepositPaymentMethod) {
    setPaymentMethod(method)
  }

  function handleUpdateDetails(patch: Partial<TrainingDetails>) {
    setDetails((d) => ({ ...d, ...patch }))
  }

  function handleBack() {
    setSubmitError('')
    setStep((s) => Math.max(1, s - 1) as TrainingDrawerStep)
  }

  function handleContinue() {
    setStep((s) => Math.min(4, s + 1) as TrainingDrawerStep)
  }

  async function handleSubmit() {
    if (!selectedDate || !paymentMethod) return
    setSubmitting(true)
    setSubmitError('')
    const result = await createTrainingHold({
      dateId: selectedDate.id,
      paymentMethod,
      firstName: details.firstName.trim(),
      lastName: details.lastName.trim(),
      email: details.email.trim(),
      phone: details.phone.trim(),
      city: details.city.trim(),
      province: details.province,
      honeypot: honeypot || undefined,
    })
    setSubmitting(false)
    if (result.ok) {
      setSubmitted(true)
    } else {
      setSubmitError(result.error ?? 'Something went wrong. Please try again.')
    }
  }

  return {
    drawerOpen,
    openDrawer,
    closeDrawer,
    step,
    selectedOption,
    trainingDates,
    datesLoading,
    selectedDate,
    paymentMethod,
    details,
    honeypot,
    setHoneypot,
    submitting,
    submitError,
    submitted,
    handleSelectDate,
    handleSelectPaymentMethod,
    handleUpdateDetails,
    handleBack,
    handleContinue,
    handleSubmit,
  }
}
