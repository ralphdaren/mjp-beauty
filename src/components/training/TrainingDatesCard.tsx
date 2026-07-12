import { Loader2 } from 'lucide-react'
import type { TrainingDateGroup } from '@/types/training'
import TrainingDateRow from './TrainingDateRow'

interface TrainingDatesCardProps {
  groups: TrainingDateGroup[]
  loading: boolean
  onViewAll: () => void
}

export default function TrainingDatesCard({ groups, loading, onViewAll }: TrainingDatesCardProps) {
  return (
    <div className="h-full flex flex-col rounded-2xl border border-[#e3e2de] bg-white shadow-[0_8px_32px_rgba(130,112,100,0.10)] p-10">
      <h3 className="about-heading text-2xl sm:text-3xl font-semibold text-[#3d3028] leading-tight mb-2">
        Training Dates
      </h3>
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
