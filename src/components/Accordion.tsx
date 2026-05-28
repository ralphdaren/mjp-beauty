import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionProps {
  q: string
  a: ReactNode
}

export default function Accordion({ q, a }: AccordionProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#e3e2de] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-start justify-between gap-4 py-4"
      >
        <span className="text-sm font-medium text-[#3d3530] leading-snug">{q}</span>
        <ChevronDown
          size={16}
          className={`mt-0.5 shrink-0 text-[#827064] transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="text-sm text-[#6b5f58] leading-relaxed pb-4">{a}</div>
        </div>
      </div>
    </div>
  )
}
