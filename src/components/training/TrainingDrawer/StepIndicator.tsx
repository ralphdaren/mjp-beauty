import { Fragment } from 'react'
import { Check } from 'lucide-react'
import { TRAINING_DRAWER_STEPS, type TrainingDrawerStep } from '../../../types/training'

export default function StepIndicator({ step }: { step: TrainingDrawerStep }) {
  return (
    <div className="px-6 pt-5 pb-4 shrink-0">
      <div className="flex items-start">
        {TRAINING_DRAWER_STEPS.map((label, idx) => {
          const stepNum   = (idx + 1) as TrainingDrawerStep
          const isComplete = step > stepNum
          const isCurrent  = step === stepNum

          return (
            <Fragment key={label}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ease-in-out ${
                    isComplete
                      ? 'bg-[#3d3530] text-white scale-100'
                      : isCurrent
                      ? 'bg-[#827064] text-white scale-110 ring-[3px] ring-[#827064]/25'
                      : 'bg-[#e3e2de] text-[#a0948a] scale-100'
                  }`}
                >
                  <span className={`absolute transition-all duration-300 ease-in-out ${isComplete ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                    {stepNum}
                  </span>
                  <span className={`absolute transition-all duration-300 ease-in-out ${isComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    <Check size={11} />
                  </span>
                </div>
                <span
                  className={`text-[10px] text-center leading-tight whitespace-nowrap transition-all duration-300 ${
                    isCurrent ? 'text-[#3d3530] font-medium' : 'text-[#a0948a]'
                  }`}
                >
                  {label}
                </span>
              </div>

              {idx < TRAINING_DRAWER_STEPS.length - 1 && (
                <div className="flex-1 mt-3.5 mx-1 h-px bg-[#e3e2de] relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#3d3530] transition-all duration-500 ease-out"
                    style={{ width: step > stepNum ? '100%' : '0%' }}
                  />
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
