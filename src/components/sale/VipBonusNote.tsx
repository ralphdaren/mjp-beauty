import { isVipBonusShowing } from '@/data/promos'

// Black Friday: free strategy call for the first 3 VIP enrollments. Hidden outside the sale or once claimed.
export default function VipBonusNote({ tone, className = '' }: { tone: 'light' | 'dark'; className?: string }) {
  if (!isVipBonusShowing()) return null
  const box = tone === 'dark' ? 'border-white/25 text-[#f6f2ec]/90' : 'border-[#d6cec8] bg-[#f6f2ec] text-[#3d3028]'
  const label = tone === 'dark' ? 'text-[#c9bcb1]' : 'text-[#827064]'
  return (
    <div className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${box} ${className}`}>
      <p className={`text-[0.6rem] uppercase tracking-[0.2em] font-semibold mb-1 ${label}`}>Black Friday bonus</p>
      <p>The first 3 to enroll get a free 60-min Biz Strategy Call ($267 value).</p>
    </div>
  )
}
