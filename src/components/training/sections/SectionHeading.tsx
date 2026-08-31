type SectionHeadingProps = {
  eyebrow?: string
  title: string
  caption: string
  className?: string
}

export default function SectionHeading({ eyebrow, title, caption, className = '' }: SectionHeadingProps) {
  return (
    <div className={`anim-fade-up text-center ${className}`}>
      {eyebrow && (
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#a0948a] mb-3">{eyebrow}</p>
      )}
      <h2 className="about-heading text-3xl sm:text-4xl md:text-[2.6rem] font-semibold text-[#3d3028] leading-tight">
        {title}
      </h2>
      <div className="mt-8 flex items-center gap-4 max-w-xl mx-auto">
        <div className="flex-1 h-px bg-[#d6cec8]" />
        <p className="text-[0.72rem] uppercase tracking-[0.22em] text-[#a0948a] whitespace-nowrap">
          {caption}
        </p>
        <div className="flex-1 h-px bg-[#d6cec8]" />
      </div>
    </div>
  )
}
