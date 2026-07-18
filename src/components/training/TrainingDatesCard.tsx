import { useEffect, useRef, useState } from 'react'
import { CircleAlert, Loader2 } from 'lucide-react'
import type { TrainingDateGroup } from '@/types/training'
import TrainingDateRow from './TrainingDateRow'

interface TrainingDatesCardProps {
  groups: TrainingDateGroup[]
  loading: boolean
  onViewAll: () => void
  onHowToEnroll: () => void
}

export default function TrainingDatesCard({ groups, loading, onViewAll, onHowToEnroll }: TrainingDatesCardProps) {
  const [tipOpen, setTipOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openTip() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setTipOpen(true)
  }

  // Small grace period so the pointer can travel into the tooltip without it vanishing
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setTipOpen(false), 250)
  }

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  useEffect(() => {
    if (!tipOpen) return
    const handler = () => setTipOpen(false)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tipOpen])

  return (
    <div className="h-full flex flex-col rounded-2xl border border-[#e3e2de] bg-white shadow-[0_8px_32px_rgba(130,112,100,0.10)] p-10">
      <div
        className="relative mb-2"
        onMouseEnter={openTip}
        onMouseLeave={scheduleClose}
      >
        <h3 className="about-heading text-2xl sm:text-3xl font-semibold text-[#3d3028] leading-tight">
          Training Dates
          <button
            onClick={(e) => { e.stopPropagation(); setTipOpen((prev) => !prev) }}
            className="align-middle ml-1.5 -translate-y-0.5 inline-flex text-[#a0948a] hover:text-[#827064] transition-colors duration-200"
            aria-label="How to enroll"
          >
            <CircleAlert size={14} />
          </button>
        </h3>
        {tipOpen && (
          <div
            className="absolute top-full left-0 pt-1.5 w-56 z-20"
            onMouseEnter={openTip}
            onMouseLeave={scheduleClose}
          >
            <div className="bg-[#2a1a0e] text-white/90 text-[0.65rem] leading-relaxed tracking-wide px-3 py-2 rounded-lg shadow-lg">
              Want to know how to enroll?{' '}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => { setTipOpen(false); onHowToEnroll() }}
                className="underline underline-offset-2 text-white hover:text-white/70 transition-colors duration-200"
              >
                Click here
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="text-[#5a5047] text-base leading-relaxed mb-6">
        Reserve your seat — spots are limited each session.
      </p>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#a0948a]">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            {groups.map((group) => {
              const nextDate = group.dates[0] ?? null
              return (
                <div key={group.id}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a0948a] mb-1">
                    {group.title}
                  </p>
                  {nextDate ? (
                    <TrainingDateRow date={nextDate} />
                  ) : (
                    <p className="text-sm text-[#a0948a] py-2">No upcoming dates</p>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={onViewAll}
            className="mt-8 w-full py-3.5 rounded-xl border border-[#3d3028] text-[#3d3028] text-[0.7rem] uppercase tracking-[0.18em] font-medium hover:bg-[#3d3028] hover:text-white transition-colors duration-200"
          >
            View All Available Dates
          </button>
        </div>
      )}
    </div>
  )
}
