import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  MFM_EVENT_PATH,
  MFM_TICKETS_HREF,
  MFM_TICKETS_NAV_CTA,
  MFM_TICKETS_PATH,
  MFM_WAITLIST_PATH,
} from '@/data/madeForMore'
import { useMfmSaleStage } from '@/hooks/useMfmSaleStage'

export default function MadeForMoreNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const stage = useMfmSaleStage()
  const { pathname } = useLocation()
  const onTicketsPage = pathname === MFM_TICKETS_PATH
  const onWaitlistPage = pathname === MFM_WAITLIST_PATH

  // The tickets and waitlist pages step back to the event page; the event page
  // steps out to the main site.
  const isSubPage = onTicketsPage || onWaitlistPage
  const backTo = isSubPage ? MFM_EVENT_PATH : '/'
  const backLabel = isSubPage ? 'Back to Made For More' : 'Back to MJP Beauty'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={[
        'fixed top-0 left-0 w-full z-50 transition-colors duration-300',
        scrolled ? 'mfm-nav-glass' : 'bg-transparent',
      ].join(' ')}
    >
      <nav className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-16 h-16 sm:h-20 flex items-center justify-between gap-4">
        <Link
          to={backTo}
          aria-label={backLabel}
          className="group inline-flex items-center gap-2 text-[#3d3028]/75 hover:text-[#3d3028] transition-colors duration-200"
        >
          <ArrowLeft
            size={18}
            className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <span className="text-[0.7rem] sm:text-[0.75rem] uppercase tracking-[0.18em] whitespace-nowrap">
            <span className="hidden sm:inline">{backLabel}</span>
            <span className="sm:hidden">Back</span>
          </span>
        </Link>

        {!isSubPage && (
        <a
          href={MFM_TICKETS_HREF[stage]}
          className="shrink-0 inline-flex items-center h-10 sm:h-11 px-5 sm:px-7 rounded-full bg-[#3d3028] text-[#f6f2ec] text-[0.68rem] sm:text-[0.72rem] uppercase tracking-[0.18em] font-medium hover:bg-[#2c221c] active:scale-[0.99] transition-all duration-200 whitespace-nowrap"
        >
          {MFM_TICKETS_NAV_CTA[stage]}
        </a>
        )}
      </nav>
    </header>
  )
}
