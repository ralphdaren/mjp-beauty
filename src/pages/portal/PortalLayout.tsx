import { Link, NavLink, Outlet } from 'react-router-dom'
import { BookOpen, Award, CalendarDays, UserRound, LogOut, type LucideIcon } from 'lucide-react'
import logoBrown from '@/assets/brand-kit/logo-brown.png'
import { useAuth } from '@/lib/auth/AuthProvider'

const NAV: Array<{ to: string; label: string; tab: string; icon: LucideIcon; soon?: boolean }> = [
  { to: '/portal', label: 'My Courses', tab: 'Courses', icon: BookOpen },
  { to: '/portal/certificates', label: 'Certificates', tab: 'Certificates', icon: Award },
  { to: '/portal/appointments', label: 'Appointments', tab: 'Booking', icon: CalendarDays, soon: true },
  { to: '/portal/account', label: 'Account', tab: 'Account', icon: UserRound },
]

// eslint-disable-next-line react-refresh/only-export-components
export function firstName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] ?? ''
}

export default function PortalLayout() {
  const { profile, signOut } = useAuth()
  const name = firstName(profile?.full_name)

  return (
    <div className="min-h-screen bg-brand-light text-[#3d3530]">
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-brand-border flex items-center justify-between px-4 lg:px-6">
        <Link to="/" className="shrink-0">
          <img src={logoBrown} alt="MJP Beauty" className="h-10 w-auto" />
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-brand hover:underline">
              Back to dashboard
            </Link>
          )}
          {name && <span className="hidden sm:inline text-brand">{name}</span>}
          <button type="button" onClick={() => void signOut()} className="flex items-center gap-1.5 text-brand hover:text-[#3d3530]">
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </header>

      <div className="flex">
        <nav className="hidden lg:block w-60 shrink-0 min-h-[calc(100vh-4rem)] bg-white border-r border-brand-border p-3" aria-label="Portal">
          {NAV.map(({ to, label, icon: Icon, soon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/portal'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm mb-1 ${
                  isActive ? 'bg-brand-light font-semibold text-[#3d3530]' : 'text-brand hover:bg-brand-light/60'
                }`
              }
            >
              <Icon size={18} />
              {label}
              {soon && <span className="ml-auto rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand-muted">Soon</span>}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 min-w-0 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-brand-border grid grid-cols-4"
        aria-label="Portal tabs"
      >
        {NAV.map(({ to, tab, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/portal'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] ${isActive ? 'text-[#3d3530] font-semibold' : 'text-brand-muted'}`
            }
          >
            <Icon size={20} />
            {tab}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
