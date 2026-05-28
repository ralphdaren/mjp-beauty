import { useBackToTop } from '@/hooks/useBackToTop'

export default function BackToTop() {
  const show = useBackToTop()
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={['back-to-top', show ? 'back-to-top--visible' : ''].join(' ')}
    >
      <span className="back-to-top-arrow">↑</span>
      <span className="back-to-top-label">BACK TO TOP</span>
    </button>
  )
}
