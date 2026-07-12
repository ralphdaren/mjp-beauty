import type { TrainingDate } from '@/lib/shopify'
import { formatShortDate } from '@/lib/utils'

interface TrainingDateRowProps {
  date: TrainingDate
  index?: number
  bordered?: boolean
}

export default function TrainingDateRow({ date, index, bordered = false }: TrainingDateRowProps) {
  const isSoldOut = date.spotsRemaining <= 0

  return (
    <div className={`flex items-center gap-4 py-4 ${bordered ? 'border-t border-[#e3e2de]' : ''}`}>
      {index !== undefined && (
        <span className="text-[0.7rem] font-medium text-[#a0948a] shrink-0 w-6">
          {String(index + 1).padStart(2, '0')}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm sm:text-base font-semibold text-[#3d3028] leading-snug">
          {formatShortDate(date.date)}
        </p>
        <p className="text-xs sm:text-sm text-[#a0948a]">{date.location}</p>
      </div>
      <span
        className={`text-xs sm:text-sm font-semibold uppercase tracking-[0.06em] text-right shrink-0 ${
          isSoldOut ? 'text-[#a35a3d]' : 'text-[#5a5047]'
        }`}
      >
        {isSoldOut ? 'Sold Out' : `${date.spotsRemaining} spot${date.spotsRemaining === 1 ? '' : 's'} left`}
      </span>
    </div>
  )
}
