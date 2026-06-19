import { X } from 'lucide-react'

interface VideoModalProps {
  src: string
  onClose: () => void
}

export default function VideoModal({ src, onClose }: VideoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-xs w-full animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
          aria-label="Close video"
        >
          <X size={22} />
        </button>
        <video
          src={src}
          controls
          autoPlay
          playsInline
          className="w-full rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  )
}
