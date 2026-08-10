import { Users } from 'lucide-react'

export default function MentorshipPanel() {
  return (
    <div className="px-6 py-5 max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Users size={28} className="mb-4 text-[#d5cbc0]" />
        <p className="text-sm font-medium text-[#6b5f58]">Biz Mentorship</p>
        <p className="mt-1 text-sm text-[#a0948a]">Nothing here yet.</p>
      </div>
    </div>
  )
}
