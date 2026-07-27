import { useCallback, useRef, useState } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useTrainingBookingState } from '@/hooks/useTrainingBookingState'
import { useTrainingDateGroups } from '@/hooks/useTrainingDateGroups'
import BackToTop from '@/components/BackToTop'
import TrainingHero from '@/components/training/sections/TrainingHero'
import TrainingIntro from '@/components/training/sections/TrainingIntro'
import HowItWorks from '@/components/training/sections/HowItWorks'
import ChooseYourPath from '@/components/training/sections/ChooseYourPath'
import StudentPerks from '@/components/training/sections/StudentPerks'
import TrainingInfoTabs, { type TrainingTabId } from '@/components/training/TrainingInfoTabs'
import BrowGuidePopup from '@/components/training/BrowGuidePopup'
import { useScrollPopupTrigger } from '@/hooks/useScrollPopupTrigger'
import TrainingDrawer from '@/components/training/TrainingDrawer'
import TrainingDatesModal from '@/components/training/TrainingDatesModal'
import type { TrainingOptionCard } from '@/types/training'

export default function InPersonTrainingPage() {
  const [datesModalOpen, setDatesModalOpen] = useState(false)
  const [infoTab, setInfoTab] = useState<TrainingTabId>('enroll')
  const infoTabsRef = useRef<HTMLElement>(null)

  useScrollAnimation()
  const training = useTrainingBookingState()
  const { groups: dateGroups, loading: datesLoading } = useTrainingDateGroups()
  const guidePopup = useScrollPopupTrigger('mjp-training-guide-popup-dismissed')

  const handleHowToEnroll = useCallback(() => {
    setInfoTab('enroll')
    infoTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleBookNow = useCallback((card: TrainingOptionCard) => {
    training.openDrawer({ id: card.id, title: card.title, price: card.price })
  }, [training])

  return (
    <main>
      <TrainingHero />
      <TrainingIntro />
      <HowItWorks />

      <ChooseYourPath
        dateGroups={dateGroups}
        datesLoading={datesLoading}
        onViewAllDates={() => setDatesModalOpen(true)}
        onHowToEnroll={handleHowToEnroll}
        onBookNow={handleBookNow}
      />

      <StudentPerks />

      <TrainingInfoTabs sectionRef={infoTabsRef} active={infoTab} onChange={setInfoTab} />

      <BackToTop />

      <TrainingDrawer
        open={training.drawerOpen}
        onClose={training.closeDrawer}
        step={training.step}
        selectedOption={training.selectedOption}
        trainingDates={training.trainingDates}
        datesLoading={training.datesLoading}
        selectedDate={training.selectedDate}
        onSelectDate={training.handleSelectDate}
        paymentMethod={training.paymentMethod}
        onSelectPaymentMethod={training.handleSelectPaymentMethod}
        details={training.details}
        onUpdateDetails={training.handleUpdateDetails}
        honeypot={training.honeypot}
        onHoneypotChange={training.setHoneypot}
        submitting={training.submitting}
        submitError={training.submitError}
        submitted={training.submitted}
        onSubmit={training.handleSubmit}
        onBack={training.handleBack}
        onContinue={training.handleContinue}
      />

      {datesModalOpen && (
        <TrainingDatesModal
          groups={dateGroups}
          loading={datesLoading}
          onClose={() => setDatesModalOpen(false)}
        />
      )}

      {guidePopup.show && <BrowGuidePopup onClose={guidePopup.dismiss} />}
    </main>
  )
}
