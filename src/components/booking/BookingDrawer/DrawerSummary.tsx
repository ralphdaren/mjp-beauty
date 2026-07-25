import { useState } from 'react'
import { ChevronLeft, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import type { BookingItem } from '../../../types/booking'
import { MAX_SERVICES_PER_BOOKING } from '../../../types/booking'
import { formatDuration, tierMinutes } from '../../../lib/catalog'
import { basketTotals, formatMoney } from '../../../lib/pricing'

interface DrawerSummaryProps {
  items: BookingItem[]
  onEditItem: (id: string) => void
  onRemoveItem: (id: string) => void
  onAddAnother: () => void
  onBack: () => void
  onContinue: () => void
}

export default function DrawerSummary({
  items,
  onEditItem,
  onRemoveItem,
  onAddAnother,
  onBack,
  onContinue,
}: DrawerSummaryProps) {
  const [expanded, setExpanded] = useState(true)

  const { prefix, subtotal } = basketTotals(items)
  const totalMinutes = items.reduce((sum, item) => sum + tierMinutes(item.tier), 0)
  const atLimit = items.length >= MAX_SERVICES_PER_BOOKING

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-[#827064] hover:text-[#3d3530] transition-colors mb-5"
      >
        <ChevronLeft size={13} />
        Back
      </button>

      <p className="text-sm font-medium text-[#3d3530] mb-5">Appointment summary</p>

      <div className="rounded-2xl border border-[#e3e2de] overflow-hidden">
        {/* Totals header — doubles as the collapse toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#fdf9f6] transition-colors"
          aria-expanded={expanded}
        >
          <div>
            <p className="text-base font-semibold text-[#3d3530]">
              {items.length} {items.length === 1 ? 'service' : 'services'}
            </p>
            <p className="text-xs text-[#a0948a] mt-0.5">
              {formatMoney(prefix, subtotal)}
              {totalMinutes > 0 && <>  ·  {formatDuration(totalMinutes * 60000)}</>}
            </p>
          </div>
          <span className="shrink-0 w-9 h-9 rounded-full bg-[#f6f2ec] flex items-center justify-center">
            <ChevronUp
              size={16}
              className={`text-[#3d3530] transition-transform duration-300 ${expanded ? '' : 'rotate-180'}`}
            />
          </span>
        </button>

        {expanded && (
          <ul className="border-t border-[#e3e2de] px-5 py-4 space-y-4">
            {items.map((item, index) => (
              <li key={item.id} className="relative flex gap-3">
                {/* Timeline rail — services run back to back in this order */}
                <div className="flex flex-col items-center pt-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c0b4ac]" />
                  {index < items.length - 1 && <span className="w-px flex-1 bg-[#e3e2de] mt-1" />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#3d3530] leading-snug">{item.service.name}</p>
                  <p className="text-xs text-[#a0948a] leading-snug mt-0.5">{item.tier.label}</p>
                  {item.tier.duration && (
                    <p className="text-[10px] text-[#c0b4ac] mt-0.5">{item.tier.duration}</p>
                  )}
                </div>

                <div className="flex items-start gap-1 shrink-0">
                  <p className="text-sm text-[#3d3530] whitespace-nowrap mt-0.5">{item.tier.price}</p>
                  <button
                    onClick={() => onEditItem(item.id)}
                    className="p-1.5 rounded-full text-[#a0948a] hover:bg-[#f0ece6] hover:text-[#3d3530] transition-colors"
                    aria-label={`Edit ${item.service.name}`}
                  >
                    <Pencil size={13} />
                  </button>
                  {items.length > 1 && (
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-full text-[#a0948a] hover:bg-[#f0ece6] hover:text-red-500 transition-colors"
                      aria-label={`Remove ${item.service.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={onAddAnother}
        disabled={atLimit}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-3 rounded-full border border-dashed border-[#c0b4ac] text-xs tracking-[0.1em] uppercase text-[#827064] disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:border-[#827064] hover:enabled:bg-[#fdf9f6] hover:enabled:text-[#3d3530] transition-all"
      >
        <Plus size={14} />
        Add another service
      </button>

      {atLimit && (
        <p className="mt-2 text-[11px] text-[#a0948a] text-center">
          That's the most services we can fit into one appointment.
        </p>
      )}

      <p className="mt-5 text-[11px] text-[#a0948a] leading-relaxed">
        Your services run back to back in one visit. Prices shown are before tax — you'll see the
        full total before confirming.
      </p>

      <button
        disabled={items.length === 0}
        onClick={onContinue}
        className="mt-5 w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full disabled:opacity-35 disabled:cursor-not-allowed hover:enabled:bg-[#2a2320] active:enabled:scale-[0.98] transition-all"
      >
        Next
      </button>
    </div>
  )
}
