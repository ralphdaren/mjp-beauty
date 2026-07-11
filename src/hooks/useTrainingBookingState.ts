import { useState, useEffect } from 'react'
import { getTrainingDates, type TrainingDate } from '../lib/shopify'
import type { TrainingOption, TrainingDrawerStep, DepositPaymentMethod } from '../types/training'

export function useTrainingBookingState() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [step, setStep] = useState<TrainingDrawerStep>(1)
  const [selectedOption, setSelectedOption] = useState<TrainingOption | null>(null)

  const [trainingDates, setTrainingDates] = useState<TrainingDate[]>([])
  const [datesLoading, setDatesLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<TrainingDate | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<DepositPaymentMethod | null>(null)

  // Fetch available dates from Shopify whenever the selected training option changes
  useEffect(() => {
    if (!selectedOption) { setTrainingDates([]); return }
    setDatesLoading(true)
    getTrainingDates(selectedOption.handle)
      .then(setTrainingDates)
      .finally(() => setDatesLoading(false))
  }, [selectedOption?.handle])

  function openDrawer(option: TrainingOption) {
    setSelectedOption(option)
    setSelectedDate(null)
    setPaymentMethod(null)
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

  function handleBack() {
    setStep((s) => Math.max(1, s - 1) as TrainingDrawerStep)
  }

  function handleContinue() {
    setStep((s) => Math.min(4, s + 1) as TrainingDrawerStep)
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
    handleSelectDate,
    handleSelectPaymentMethod,
    handleBack,
    handleContinue,
  }
}
