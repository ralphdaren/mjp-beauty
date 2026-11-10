import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

export default function CoursesPlaceholderPanel() {
  return (
    <div className="px-6 py-5 max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen size={28} className="mb-4 text-[#d5cbc0]" />
        <p className="text-sm font-medium text-[#6b5f58]">Online Courses</p>
        <p className="mt-1 max-w-sm text-sm text-[#a0948a]">
          Course management is coming next. For now you can open the student portal to see what students see.
        </p>
        <Link
          to="/portal"
          className="mt-5 inline-flex items-center rounded-md bg-[#3d3530] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Open student portal
        </Link>
      </div>
    </div>
  )
}
