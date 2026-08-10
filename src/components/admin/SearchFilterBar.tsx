import { useEffect, useRef, useState } from 'react'
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'

export interface SelectFilter {
  label: string
  /** Shown when nothing is picked, e.g. "All services". */
  allLabel: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

interface SearchFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  /** Date-range bounds, as yyyy-mm-dd. */
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  /** Dropdowns below the date range — whatever the panel can be sliced by. */
  selects: SelectFilter[]
  hasActiveFilters: boolean
  onClear: () => void
}

/** Search input plus a Filter popover, shared by the bookings panels. */
export default function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = 'Search by name or email...',
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  selects,
  hasActiveFilters,
  onClear,
}: SearchFilterBarProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0948a]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-[#e3e2de] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530] transition-colors"
        />
      </div>

      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 bg-white border rounded-xl px-4 py-2.5 text-xs font-medium transition-colors ${
            open || hasActiveFilters
              ? 'border-[#3d3530] text-[#3d3530]'
              : 'border-[#e3e2de] text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530]'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filter
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-lg border border-[#e3e2de] p-5 z-20 space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] block mb-1.5">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="w-full border border-[#e3e2de] rounded-xl px-3 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] block mb-1.5">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="w-full border border-[#e3e2de] rounded-xl px-3 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530]"
              />
            </div>

            <div className="border-t border-[#e3e2de]" />

            {selects.map((s) => (
              <div key={s.label}>
                <label className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] block mb-1.5">{s.label}</label>
                <div className="relative">
                  <select
                    value={s.value}
                    onChange={(e) => s.onChange(e.target.value)}
                    className="w-full appearance-none border border-[#e3e2de] rounded-xl pl-3 pr-9 py-2.5 text-sm text-[#3d3530] focus:outline-none focus:border-[#3d3530] bg-white"
                  >
                    <option value="">{s.allLabel}</option>
                    {s.options.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a0948a]" />
                </div>
              </div>
            ))}

            <button
              onClick={onClear}
              className="w-full py-2.5 border border-[#e3e2de] rounded-full text-xs font-medium text-[#6b5f58] hover:border-[#3d3530] hover:text-[#3d3530] transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
