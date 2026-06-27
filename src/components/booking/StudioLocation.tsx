const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const PLACE_QUERY = '186+Provencher+Blvd,Winnipeg,MB+R2H+0G3'
const EMBED_URL = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${PLACE_QUERY}&zoom=14`
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${PLACE_QUERY}`

export default function StudioLocation() {
  return (
    <section>
      <div className="relative h-[780px]">
        <iframe
          src={EMBED_URL}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="MJP Beauty Studio Location"
        />

        {/* Section header card - top right */}
        <div className="absolute top-8 right-8 bg-white rounded-2xl shadow-2xl px-8 py-6 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#a0948a] mb-2">Studio Location</p>
          <h2 className="text-3xl font-semibold text-[#3d3530]">
            Find the Studio
          </h2>
        </div>

        {/* Info card - top left */}
        <div className="absolute top-1/2 -translate-y-1/2 left-8 bg-white rounded-2xl shadow-2xl p-8 w-[320px]">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a] mb-1">
            Find MJP Beauty
          </p>
          <p className="text-xs text-[#6b5f58] mb-3">in the heart of St. Boniface, Winnipeg</p>
          <h3 className="text-xl font-bold text-[#3d3530] mb-7">
            186 Provencher Blvd
          </h3>

          {/* Address */}
          <div className="flex gap-4 mb-5">
            <div className="w-8 h-8 rounded-full bg-[#f6f2ec] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a0948a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-1">Address</p>
              <p className="text-sm text-[#3d3530]">Winnipeg, MB R2H 0G3</p>
            </div>
          </div>

          {/* Hours */}
          <div className="flex gap-4 mb-7">
            <div className="w-8 h-8 rounded-full bg-[#f6f2ec] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a0948a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="w-full">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#a0948a] mb-2">Hours</p>
              <div className="text-sm text-[#3d3530] space-y-1.5">
                <div className="flex justify-between">
                  <span>Tuesday – Friday</span>
                  <span className="font-medium">10am – 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">9am – 4pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday – Monday</span>
                  <span className="text-[#a0948a]">Closed</span>
                </div>
              </div>
            </div>
          </div>

          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#2a2220] text-white text-center text-[10px] tracking-[0.3em] uppercase py-4 rounded-full hover:bg-[#3d3530] transition-colors duration-200"
          >
            Get Directions
          </a>
        </div>
      </div>
    </section>
  )
}
