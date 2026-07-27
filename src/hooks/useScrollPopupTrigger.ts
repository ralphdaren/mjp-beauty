import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/**
 * Shows a popup once per session. Dismissing it remembers the choice for the
 * session under `sessionKey`, so each popup needs its own key.
 *
 * Fires when `triggerRef` scrolls into view if one is given — anchor it to the
 * element the popup should follow. Without a ref it falls back to roughly 72%
 * of total page scroll, which drifts as a page grows, so prefer the ref.
 */
export function useScrollPopupTrigger(
  sessionKey: string,
  triggerRef?: RefObject<HTMLElement | null>,
) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(sessionKey)) return

    const target = triggerRef?.current
    if (target) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          setShow(true)
          observer.disconnect()
        }
      })
      observer.observe(target)
      return () => observer.disconnect()
    }

    function handleScroll() {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (scrolled / total >= 0.72) {
        setShow(true)
        window.removeEventListener('scroll', handleScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sessionKey, triggerRef])

  function dismiss() {
    setShow(false)
    sessionStorage.setItem(sessionKey, '1')
  }

  return { show, dismiss }
}
