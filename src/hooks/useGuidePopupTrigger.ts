import { useEffect, useState } from 'react'

const GUIDE_POPUP_SESSION_KEY = 'mjp-training-guide-popup-dismissed'

/**
 * Shows the brow guide popup once per session, after the visitor has read
 * roughly 72% of the page. Dismissing it remembers the choice for the session.
 */
export function useGuidePopupTrigger() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(GUIDE_POPUP_SESSION_KEY)) return

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
  }, [])

  function dismiss() {
    setShow(false)
    sessionStorage.setItem(GUIDE_POPUP_SESSION_KEY, '1')
  }

  return { show, dismiss }
}
