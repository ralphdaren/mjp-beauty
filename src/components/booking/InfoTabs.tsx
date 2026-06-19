import { useState } from 'react'
import { FileText, HelpCircle, Heart } from 'lucide-react'
import Accordion from '../Accordion'
import { FAQ_DATA, AFTERCARE_DATA } from '../../data/booking'

const INFO_TABS = [
  { id: 'policies',  label: 'Booking Policies', Icon: FileText },
  { id: 'faq',       label: 'FAQ',              Icon: HelpCircle },
  { id: 'aftercare', label: 'Aftercare',        Icon: Heart },
] as const

type InfoTabId = (typeof INFO_TABS)[number]['id']

// ─── Tab content components ───────────────────────────────────────────────────

function BookingPoliciesContent() {
  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-sm text-[#6b5f58] leading-relaxed mb-6">
        Please read the following policies and pre-appointment guidelines prior to making your appointment.
      </p>
      <Accordion
        q="How do I secure my appointment slot?"
        a={
          <div className="space-y-2">
            <p>If you book <strong className="text-[#3d3530] font-semibold">online</strong>, a credit card on file is required. It will only be charged 50% of the booked service if you fail to comply with the cancellation/late/no-show policies below.</p>
            <p>If you book <strong className="text-[#3d3530] font-semibold">directly through Micah</strong>, a 50% non-refundable deposit is required to secure your spot. Failure to meet the cancellation policy will result in forfeiture of that deposit.</p>
          </div>
        }
      />
      <Accordion
        q="What is the refund policy?"
        a={
          <div className="space-y-2">
            <p>Refunds are not offered — clients pay for Micah's time and products, which cannot be "returned."</p>
            <p>However, customer satisfaction is a priority. If you are unhappy with a service, please let Micah know so you can address your concerns and work out a solution together.</p>
          </div>
        }
      />
      <Accordion
        q="What is the cancellation policy?"
        a={<p>A <strong className="text-[#3d3530] font-semibold">48-hour (2-day) notice</strong> is required to reschedule or cancel. Failure to do so will result in a cancellation fee charged to your card on file.</p>}
      />
      <Accordion
        q="What happens if I'm late?"
        a={<p>A <strong className="text-[#3d3530] font-semibold">10-minute grace period</strong> is given to those running late. If you are more than 10 minutes late without communication, your appointment will be cancelled and a cancellation fee will be charged. If a last-minute emergency occurs, please communicate with Micah so you can work something out.</p>}
      />
      <Accordion
        q="What is the no-show policy?"
        a={<p><strong className="text-[#3d3530] font-semibold">No-shows are not tolerated at MJP Beauty.</strong> This will result in an automatic cancellation fee charged to your credit card on file.</p>}
      />
      <Accordion
        q="New client — what should I expect?"
        a={
          <ol className="list-decimal list-inside space-y-2">
            <li>Once your appointment request is accepted, you'll receive a confirmation email with all appointment details.</li>
            <li>Three days before your appointment, a confirmation text will be sent to confirm your presence.</li>
            <li>Review the pre-appointment guidelines to properly prepare for your visit.</li>
          </ol>
        }
      />
      <Accordion
        q="What payment methods are accepted?"
        a={
          <div className="space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Cash</li>
              <li>Debit or Credit</li>
              <li>Apple Pay / Google Pay</li>
              <li>E-Transfer (must be received prior to leaving the studio)</li>
            </ul>
            <p className="mt-2">Payments must be paid in full upon completion of the service.</p>
          </div>
        }
      />
      <Accordion
        q="Pre-appointment guidelines — Brow services"
        a={
          <ul className="list-disc list-inside space-y-2">
            <li>Arrive with <strong className="text-[#3d3530] font-semibold">clean brows</strong> — no makeup or products on/around the brows. Moisturizer is okay and recommended.</li>
            <li>For Brow Lamination, <strong className="text-[#3d3530] font-semibold">avoid trimming your brows at least 3 weeks prior</strong> — we want to work with as much hair as possible.</li>
            <li>Inform Micah if you are using Retinoids, acne medications, Vitamin A products, or any skin-thinning treatments. Stop usage at least <strong className="text-[#3d3530] font-semibold">2–3 weeks prior</strong> to your appointment.</li>
          </ul>
        }
      />
      <Accordion
        q="Pre-appointment guidelines — Lash Lift services"
        a={
          <ul className="list-disc list-inside space-y-2">
            <li>Do not arrive with any makeup, especially eye makeup (mascara, concealer, foundation, eyeliner, eyeshadow).</li>
            <li>Arrive with <strong className="text-[#3d3530] font-semibold">uncurled, freshly cleaned lashes</strong>.</li>
          </ul>
        }
      />
      <div className="mt-4 bg-[#f6f2ec] border border-[#e3e2de] rounded-xl p-4 text-sm text-[#6b5f58]">
        <strong className="text-[#827064]">Additional info:</strong> Please read the confirmation
        email after booking — it contains all details about the studio address and parking instructions.
      </div>
    </div>
  )
}

function FaqContent() {
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      {FAQ_DATA.map((group) => (
        <div key={group.category}>
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#827064] mb-1 pb-2 border-b border-[#e3e2de]">
            {group.category}
          </h3>
          <div>
            {group.items.map((item) => (
              <Accordion key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AftercareContent() {
  return (
    <div className="max-w-2xl mx-auto">
      {AFTERCARE_DATA.map((group) => (
        <Accordion
          key={group.category}
          q={group.category}
          a={
            <ul className="space-y-3">
              {group.items.map((item, i) => (
                <li key={i} className="flex gap-3 leading-relaxed">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#827064] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          }
        />
      ))}
    </div>
  )
}

// ─── Main InfoTabs component ──────────────────────────────────────────────────

export default function InfoTabs() {
  const [active, setActive] = useState<InfoTabId>('policies')

  return (
    <section className="bg-[#f6f2ec] border-t border-[#e3e2de] py-16">
      <div className="max-w-4xl mx-auto px-6">

        <div className="anim-fade-up text-center mb-10">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#a0948a] mb-2">Good to Know</p>
          <h2 className="text-2xl font-semibold text-[#3d3530]">Policies & Aftercare</h2>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex gap-0 border-b border-[#d9d4cf] w-full max-w-lg">
            {INFO_TABS.map(({ id, label, Icon }) => {
              const isActive = active === id
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`group relative flex-1 flex flex-col items-center gap-1.5 py-3 px-2 transition-colors duration-200 ${
                    isActive ? 'text-[#6e5f55]' : 'text-[#a0948a] hover:text-[#6e5f55]'
                  }`}
                >
                  <Icon size={15} className="transition-colors duration-200" />
                  <span className="text-[11px] tracking-[0.1em] uppercase font-semibold whitespace-nowrap transition-colors duration-200">
                    {label}
                  </span>
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#827064] rounded-full transition-all duration-300 ${
                      isActive ? 'w-3/4 opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white border border-[#e3e2de] rounded-2xl px-8 py-10 shadow-sm">
          <div key={active} className="tab-fade-in">
            {active === 'policies'  && <BookingPoliciesContent />}
            {active === 'faq'       && <FaqContent />}
            {active === 'aftercare' && <AftercareContent />}
          </div>
        </div>

      </div>
    </section>
  )
}
