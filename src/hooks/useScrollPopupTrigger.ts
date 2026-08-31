import { useEffect, useState } from 'react'
import type { RefObject } from 'react'


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
