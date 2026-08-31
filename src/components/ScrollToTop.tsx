import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    let frames = 0
    let raf = 0

    const findTarget = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (frames++ < 30) raf = requestAnimationFrame(findTarget)
      else window.scrollTo(0, 0)
    }

    raf = requestAnimationFrame(findTarget)
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash])

  return null
}
