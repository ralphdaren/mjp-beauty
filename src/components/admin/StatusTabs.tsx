import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface StatusTab<T extends string> {
  id: T
  label: string
  count: number
}

interface StatusTabsProps<T extends string> {
  tabs: Array<StatusTab<T>>
  more: Array<StatusTab<T>>
  value: T
  onChange: (value: T) => void
}

export default function StatusTabs<T extends string>({ tabs, more, value, onChange }: StatusTabsProps<T>) {
  const [open, setOpen] = useState(false)
  const groupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!groupRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const head = tabs[tabs.length - 1]
  const flat = tabs.slice(0, -1)
  const shown = more.find((m) => m.id === value) ?? head
  const menuItems = [head, ...more].filter((m) => m.id !== shown.id)

  const groupActive = value === shown.id

  const text = 'text-xs font-medium capitalize whitespace-nowrap transition-colors duration-200'
  const tone = (active: boolean) =>
    active ? 'text-white' : 'text-[#6b5f58] group-hover:text-[#3d3530]'

  const badge = (active: boolean) =>
    `shrink-0 rounded-full px-1.5 py-0.5 text-[10px] transition-colors duration-200 ${
      active ? 'bg-white/15 text-white' : 'bg-[#f6ebe0] text-[#b07d4e]'
    }`

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-[#e3e2de] bg-white p-1">
      {flat.map((t) => {
        const active = value === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            aria-current={active ? 'page' : undefined}
            className={`group flex items-center gap-1.5 rounded-xl px-3.5 py-2 ${text} ${tone(active)} ${
              active ? 'bg-[#3d3530]' : 'hover:bg-[#f6f2ec]'
            }`}
          >
            {t.label}
            <span className={badge(active)}>{t.count}</span>
          </button>
        )
      })}

      <div ref={groupRef} className="relative">
        <div
          className={`group flex items-center rounded-xl transition-colors duration-200 ${
            groupActive ? 'bg-[#3d3530]' : 'hover:bg-[#f6f2ec]'
          }`}
        >
          <button
            onClick={() => onChange(shown.id)}
            aria-current={groupActive ? 'page' : undefined}
            className={`flex items-center gap-1.5 py-2 pl-3.5 pr-1 ${text} ${tone(groupActive)}`}
          >
            {shown.label}
            <span className={badge(groupActive)}>{shown.count}</span>
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="More statuses"
            className={`py-2 pl-0.5 pr-3 ${text} ${tone(groupActive)}`}
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-3 min-w-[9.5rem] overflow-hidden rounded-xl border border-[#ece7e0] bg-white py-1 shadow-lg"
          >
            {menuItems.map((m) => (
              <button
                key={m.id}
                role="menuitem"
                onClick={() => {
                  onChange(m.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[#6b5f58] hover:bg-[#f6f2ec] hover:text-[#3d3530] ${text}`}
              >
                {m.label}
                <span className={badge(false)}>{m.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
