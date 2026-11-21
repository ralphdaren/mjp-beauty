interface SectionHeadingProps {
  id: string
  title: string
  line: string
}

/** Shared heading for the booking page sections: large semibold serif title, short plain line beside it. */
export default function SectionHeading({ id, title, line }: SectionHeadingProps) {
  return (
    <div className="max-w-[1140px] mx-auto px-4 md:px-12 mb-7 md:mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-3 md:gap-12">
      <h2 id={id} className="display-serif !font-semibold text-[#3d3530] text-[clamp(30px,3.2vw,42px)] leading-[1.08]">
        {title}
      </h2>
      <p className="text-[15px] leading-[1.6] text-[#6b5f58] max-w-[320px]">{line}</p>
    </div>
  )
}
