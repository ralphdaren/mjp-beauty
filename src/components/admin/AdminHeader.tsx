import { Menu, RefreshCw } from 'lucide-react'
import { CATEGORY_LABEL, type AdminCategory, type PanelRefresh } from './adminShell'

interface AdminHeaderProps {
  category: AdminCategory
  onOpenSidebar: () => void
  refresh: PanelRefresh | null
}

export default function AdminHeader({ category, onOpenSidebar, refresh }: AdminHeaderProps) {
  return (
    <div className="flex items-center gap-3 bg-white px-4 py-4 lg:px-6">
      <button
        onClick={onOpenSidebar}
        className="text-[#6b5f58] transition-colors hover:text-[#3d3530] lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#a0948a] lg:hidden">MJP Beauty Dashboard</p>
      <p className="hidden text-[10px] uppercase tracking-[0.25em] text-[#a0948a] lg:block">
        {CATEGORY_LABEL[category]}
      </p>
      {refresh && (
        <button
          onClick={refresh.run}
          disabled={refresh.loading}
          className="ml-auto shrink-0 rounded-xl border border-[#e3e2de] bg-white p-2.5 text-[#6b5f58] transition-colors hover:border-[#3d3530] hover:text-[#3d3530] disabled:opacity-50"
          title="Refresh"
          aria-label="Refresh"
        >
          <RefreshCw size={15} className={refresh.loading ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  )
}
