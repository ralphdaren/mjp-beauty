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
import InstagramReels from '@/components/InstagramReels'
import CourseReviewsSection from '@/components/CourseReviewsSection'
import type { ReviewOption } from '@/components/CourseReviewsSection'
import TrainingInfoTabs, { type TrainingTabId } from '@/components/training/TrainingInfoTabs'
import BrowGuidePopup from '@/components/training/BrowGuidePopup'
import { useScrollPopupTrigger } from '@/hooks/useScrollPopupTrigger'
import TrainingDrawer from '@/components/training/TrainingDrawer'
import TrainingDatesModal from '@/components/training/TrainingDatesModal'
import type { TrainingOptionCard } from '@/types/training'

const REELS = [
  'v1785127450/ip-reel-01_ajf1jb',
  'v1785127489/ip-reel-02_gmdlew',
  'v1785127484/ip-reel-03_bvpjpx',
  'v1785127490/ip-reel-04_mga7co',
  'v1785127488/ip-reel-05_ia8c5p',
  'v1785127489/ip-reel-06_hl3uqh',
  'v1785127485/ip-reel-07_vehqzm',
  'v1785127450/ip-reel-08_poq8xj',
]

// In-person training is booked through Square, not Shopify, so these two
// products exist in Shopify purely as Judge.me review containers — they're off
// every sales channel and nothing on the site links to them. Hardcoded rather
// than read from .env because the values never differ per environment, and a
// missing Vercel var would silently hide the section in production.
const REVIEW_OPTIONS: ReviewOption[] = [
  {
    label: 'Small Group',
    handle: 'in-person-small-group-training',
    productId: '8676185505964',
  },
  {
    label: 'Private 1-on-1',
    handle: 'in-person-private-1-on-1-training',
    productId: '8676186194092',
  },
]

export default function InPersonTrainingPage() {
  const [datesModalOpen, setDatesModalOpen] = useState(false)
  const [infoTab, setInfoTab] = useState<TrainingTabId>('enroll')
  const infoTabsRef = useRef<HTMLElement>(null)
  const perksEndRef = useRef<HTMLDivElement>(null)

  useScrollAnimation()
  const training = useTrainingBookingState()
  const { groups: dateGroups, loading: datesLoading } = useTrainingDateGroups()
  // The freebie offer follows the perks pitch, so it opens as the reader
  // finishes that section rather than at an arbitrary scroll depth.
  const guidePopup = useScrollPopupTrigger('mjp-training-guide-popup-dismissed', perksEndRef)

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

      <InstagramReels reels={REELS} />

      <StudentPerks />
      <div ref={perksEndRef} aria-hidden="true" />

      <CourseReviewsSection
        options={REVIEW_OPTIONS}
        eyebrow="Student Reviews"
        heading="What Students Are Saying."
        optionQuestion="Which training did you attend?"
        emptyMessage="Trained with Micah in person? Share how it went — you'll be the first."
      />

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
