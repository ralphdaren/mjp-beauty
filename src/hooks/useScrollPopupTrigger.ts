import { useEffect, useState } from 'react'

/**
 * Shows a popup once per session, after the visitor has read roughly 72% of the
 * page. Dismissing it remembers the choice for the session under `sessionKey`,
 * so each popup needs its own key.
 */
export function useScrollPopupTrigger(sessionKey: string) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(sessionKey)) return

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
  }, [sessionKey])

  function dismiss() {
    setShow(false)
    sessionStorage.setItem(sessionKey, '1')
  }

  return { show, dismiss }
}
