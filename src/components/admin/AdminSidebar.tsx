import { useLayoutEffect, useRef, useState } from 'react'
import { LogOut, CalendarCheck, GraduationCap, Users, X, ChevronRight, type LucideIcon } from 'lucide-react'
import { CATEGORY_LABEL, type AdminCategory, type TrainingView } from './adminShell'

const NAV: Array<{ id: AdminCategory; icon: LucideIcon }> = [
  { id: 'services', icon: CalendarCheck },
  { id: 'training', icon: GraduationCap },
  { id: 'mentorship', icon: Users },
]

const TRAINING_VIEWS: Array<{ id: TrainingView; label: string }> = [
  { id: 'bookings', label: 'Bookings' },
  { id: 'dates', label: 'Manage Dates' },
]

interface AdminSidebarProps {
  category: AdminCategory
  onSelect: (c: AdminCategory) => void
  counts: Record<AdminCategory, number>
  trainingView: TrainingView
  onTrainingViewSelect: (v: TrainingView) => void
  onSignOut: () => void
  open: boolean
  onClose: () => void
}

export default function AdminSidebar({
  category,
  onSelect,
  counts,
  trainingView,
  onTrainingViewSelect,
  onSignOut,
  open,
  onClose,
}: AdminSidebarProps) {
  const itemRefs = useRef(new Map<AdminCategory, HTMLButtonElement>())
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null)

  useLayoutEffect(() => {
    const items = itemRefs.current
    const measure = () => {
      const el = items.get(category)
      if (el) setPill({ top: el.offsetTop, height: el.offsetHeight })
    }
    measure()
    const observer = new ResizeObserver(measure)
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [category])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#3d3530]/40 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0948a]">MJP Beauty Dashboard</p>
          <button
            onClick={onClose}
            className="text-[#a0948a] transition-colors hover:text-[#3d3530] lg:hidden"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mx-6 border-t border-[#ece7e0]" />

        <nav className="relative flex-1 space-y-1 px-3 py-4">
          {pill && (
            <span
              aria-hidden="true"
              style={{ transform: `translateY(${pill.top}px)`, height: pill.height }}
              className="pointer-events-none absolute inset-x-3 top-0 rounded-xl bg-[#3d3530] transition-transform duration-300 ease-out motion-reduce:transition-none"
            />
          )}

          {NAV.map(({ id, icon: Icon }) => {
            const active = category === id
            const count = counts[id]
            const hasChildren = id === 'training'
            return (
              <div key={id}>
                <button
                  ref={(el) => {
                    if (el) itemRefs.current.set(id, el)
                    else itemRefs.current.delete(id)
                  }}
                  onClick={() => onSelect(id)}
                  aria-current={active ? 'page' : undefined}
                  aria-expanded={hasChildren ? active : undefined}
                  className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors duration-300 ${
                    active ? 'text-white' : 'text-[#6b5f58] hover:bg-[#f6f2ec] hover:text-[#3d3530]'
                  }`}
                >
                  <Icon
                    size={17}
                    className={`shrink-0 transition-colors duration-300 ${active ? 'text-white' : 'text-[#a0948a]'}`}
                  />
                  <span className="flex-1 whitespace-nowrap leading-tight">{CATEGORY_LABEL[id]}</span>
                  {count > 0 && (
                    <span
                      title={`${count} awaiting your action`}
                      className={`flex h-6 min-w-[1.5rem] shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold transition-colors duration-300 ${
                        active ? 'bg-white/15 text-white' : 'bg-[#f6ebe0] text-[#b07d4e]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                  {hasChildren && (
                    <ChevronRight
                      size={14}
                      className={`shrink-0 transition-all duration-300 ${active ? 'rotate-90 text-white/70' : 'text-[#c4b9ae]'}`}
                    />
                  )}
                </button>

                {hasChildren && active && (
                  <div className="relative ml-[1.28rem] mt-1 space-y-0.5 border-l border-[#ece7e0] pl-[0.53rem]">
                    {TRAINING_VIEWS.map((view) => {
                      const viewActive = trainingView === view.id
                      return (
                        <button
                          key={view.id}
                          onClick={() => onTrainingViewSelect(view.id)}
                          aria-current={viewActive ? 'page' : undefined}
                          className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                            viewActive
                              ? 'bg-[#f6f2ec] font-medium text-[#3d3530]'
                              : 'text-[#6b5f58] hover:bg-[#faf8f5] hover:text-[#3d3530]'
                          }`}
                        >
                          {view.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="mx-6 border-t border-[#ece7e0]" />

        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-6 py-5 text-sm font-medium text-[#6b5f58] transition-colors hover:text-[#3d3530]"
        >
          <LogOut size={16} className="text-[#a0948a]" />
          Sign out
        </button>
      </aside>
    </>
  )
}
