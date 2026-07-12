import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import type { TrainingDateGroup } from '@/types/training'
import TrainingDateRow from './TrainingDateRow'

interface TrainingDatesModalProps {
  groups: TrainingDateGroup[]
  loading: boolean
  onClose: () => void
}

export default function TrainingDatesModal({ groups, loading, onClose }: TrainingDatesModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
      onClick={dismiss}
    >
      <div
        className="relative bg-white rounded-[2rem] overflow-hidden w-full max-w-[560px] shadow-2xl flex flex-col"
        style={{
          maxHeight: '82vh',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#5a5047] hover:text-[#827064] transition-all shadow-sm"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-8 pt-10 pb-6 shrink-0 border-b border-[#e3e2de]">
          <h2 className="about-heading text-2xl font-semibold text-[#3d3028] leading-tight mb-1">
            All Training Dates
          </h2>
          <p className="text-sm text-[#5a5047]">Reserve your seat — spots are limited each session.</p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-8 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#a0948a]">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="mb-8 last:mb-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a0948a] mb-2">
                  {group.title}
                </p>
                {group.dates.length === 0 ? (
                  <p className="text-sm text-[#a0948a] py-4">No upcoming dates available.</p>
                ) : (
                  <div className="flex flex-col">
                    {group.dates.map((date, i) => (
                      <TrainingDateRow key={date.id} date={date} index={i} bordered={i !== 0} />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
