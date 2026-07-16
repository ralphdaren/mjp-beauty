import { Clock } from 'lucide-react'
import type { TrainingDate } from '../../../lib/training'
import type { TrainingOption } from '../../../types/training'
import { formatDate } from '../../../lib/utils'

interface DrawerSuccessProps {
  firstName: string
  selectedOption: TrainingOption | null
  selectedDate: TrainingDate | null
  onClose: () => void
}

export default function DrawerSuccess({ firstName, selectedOption, selectedDate, onClose }: DrawerSuccessProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center overflow-y-auto">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-5">
        <Clock size={32} className="text-amber-500" />
      </div>
      <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 text-[10px] uppercase tracking-[0.15em] font-medium px-3 py-1 rounded-full mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Spot Held — 72 Hours
      </div>
      <h2 className="text-xl font-semibold text-[#3d3530] mb-2">You're on the list!</h2>
      <p className="text-sm text-[#6b5f58] leading-relaxed mb-8">
        Hey {firstName}, your spot is reserved for 72 hours. Micah will reach out with your invoice and deposit
        instructions to lock it in.
      </p>

      <div className="bg-[#f6f2ec] rounded-2xl p-5 w-full text-left space-y-4 mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Training</p>
          <p className="text-sm font-medium text-[#3d3530]">{selectedOption?.title}</p>
        </div>
        <div className="border-t border-[#e3e2de]" />
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Date</p>
            <p className="text-sm text-[#3d3530]">{selectedDate ? formatDate(selectedDate.date) : ''}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#a0948a] mb-0.5">Location</p>
            <p className="text-sm text-[#3d3530]">{selectedDate?.location}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3.5 bg-[#3d3530] text-white text-xs tracking-[0.15em] uppercase rounded-full hover:bg-[#2a2320] active:scale-[0.98] transition-all"
      >
        Done
      </button>
    </div>
  )
}
