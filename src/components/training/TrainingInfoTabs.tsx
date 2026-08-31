import { BookOpen, HelpCircle } from 'lucide-react'
import TrainingFaq from './TrainingFaq'
import { ENROLL_STEPS } from '@/data/training'

const TRAINING_INFO_TABS = [
  { id: 'enroll', label: 'How to Enroll', Icon: BookOpen },
  { id: 'faq',    label: 'FAQ',           Icon: HelpCircle },
] as const

export type TrainingTabId = (typeof TRAINING_INFO_TABS)[number]['id']

function HowToEnroll() {
  return (
    <ol className="max-w-2xl mx-auto flex flex-col gap-5">
      {ENROLL_STEPS.map((step, i) => (
        <li key={i} className="flex gap-4 items-start">
          <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-[#f6f2ec] border border-[#e3e2de] flex items-center justify-center text-[11px] font-semibold text-[#827064]">
            {i + 1}
          </span>
          <p className="text-sm text-[#6b5f58] leading-relaxed pt-1">{step}</p>
        </li>
      ))}
    </ol>
  )
}

type TrainingInfoTabsProps = {
  sectionRef: React.RefObject<HTMLElement | null>
  active: TrainingTabId
  onChange: (id: TrainingTabId) => void
}

export default function TrainingInfoTabs({ sectionRef, active, onChange }: TrainingInfoTabsProps) {
  return (
    <section ref={sectionRef} className="bg-[#f6f2ec] border-t border-[#e3e2de] py-16">
      <div className="max-w-4xl mx-auto px-6">

        {/* Section heading */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a] mb-2">Good to Know</p>
          <h2 className="text-2xl font-semibold text-[#3d3530]">Training Information</h2>
        </div>

        {/* Tab navigator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-0 border-b border-[#d9d4cf] w-full max-w-lg">
            {TRAINING_INFO_TABS.map(({ id, label, Icon }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  onClick={() => onChange(id)}
                  className={`group relative flex-1 flex flex-col items-center gap-1.5 py-3 px-2 transition-colors duration-200 ${
                    isActive ? 'text-[#6e5f55]' : 'text-[#a0948a] hover:text-[#6e5f55]'
                  }`}
                >
                  <Icon size={15} className="transition-colors duration-200" />
                  <span className="text-[11px] tracking-[0.1em] uppercase font-semibold whitespace-nowrap transition-colors duration-200">
                    {label}
                  </span>
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#827064] rounded-full transition-all duration-300 ${
                      isActive ? 'w-3/4 opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* Content panel */}
        <div className="bg-white border border-[#e3e2de] rounded-2xl px-8 py-10 shadow-sm">
          <div key={active} className="tab-fade-in">
            {active === 'enroll' && <HowToEnroll />}
            {active === 'faq'    && <TrainingFaq />}
          </div>
        </div>

      </div>
    </section>
  )
}
