import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { AFTERCARE_DATA, FAQ_DATA } from '../../data/booking'

/** One question row for the "Before your visit" tabs. Uses <details> so it works without JS state. */
function QA({ q, a, defaultOpen }: { q: string; a: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-b border-[rgba(61,53,48,.13)]" open={defaultOpen}>
      <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-5 min-h-[58px] py-3 text-[15.5px] text-[#3d3530] cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b07b5a]">
        <span>{q}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="shrink-0 text-[#827064] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="text-[14.5px] leading-[1.7] text-[#4a403a] pb-5 max-w-[62ch]">{a}</div>
    </details>
  )
}

export function PoliciesPanel() {
  return (
    <div>
      <p className="text-[14.5px] text-[#6b5f58] leading-relaxed pt-4 pb-2">
        Please read the following policies and pre-appointment guidelines prior to making your appointment.
      </p>
      <QA
        defaultOpen
        q="How do I secure my appointment slot?"
        a={
          <div className="space-y-2">
            <p>If you book <strong className="text-[#3d3530] font-semibold">online</strong>, a credit card on file is required. It is only charged if you cancel late, cancel within 24 hours of your appointment, don't show up, or arrive more than 10 minutes late. Fees are a percentage of your full booking total, GST included:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>24 to 48 hours' notice: 50%</li>
              <li>Cancelling within 24 hours: 100%</li>
              <li>No-show: 100%</li>
              <li>More than 10 minutes late: 50%</li>
            </ul>
            <p>If your card can't be charged for any reason (for example, it has expired or has insufficient funds), the fee must be paid before <strong className="text-[#3d3530] font-semibold">any</strong> upcoming appointments. If it isn't paid, your upcoming appointments will be cancelled and you won't be able to book until the fee is paid.</p>
            <p>If you book <strong className="text-[#3d3530] font-semibold">directly through Micah</strong>, a 50% non-refundable deposit is required to secure your spot. Failure to meet the cancellation policy will result in forfeiture of that deposit.</p>
          </div>
        }
      />
      <QA
        q="What is the refund policy?"
        a={
          <div className="space-y-2">
            <p>Refunds are not offered. Clients pay for Micah's time and products, which cannot be "returned."</p>
            <p>However, customer satisfaction is a priority. If you are unhappy with a service, please let Micah know so you can address your concerns and work out a solution together.</p>
          </div>
        }
      />
      <QA
        q="What is the cancellation policy?"
        a={<p>A <strong className="text-[#3d3530] font-semibold">48-hour (2-day) notice</strong> is required to reschedule or cancel. Cancelling with 24 to 48 hours' notice is charged <strong className="text-[#3d3530] font-semibold">50% of your booking</strong>. Cancelling within 24 hours of your appointment is charged <strong className="text-[#3d3530] font-semibold">the full amount</strong>. Fees are charged to your card on file.</p>}
      />
      <QA
        q="What happens if I'm late?"
        a={<p>A <strong className="text-[#3d3530] font-semibold">10-minute grace period</strong> is given to those running late. If you are more than 10 minutes late without communication, your appointment will be cancelled and <strong className="text-[#3d3530] font-semibold">50% of your booking</strong> will be charged to your card on file. If a last-minute emergency occurs, please communicate with Micah so you can work something out.</p>}
      />
      <QA
        q="What is the no-show policy?"
        a={<p><strong className="text-[#3d3530] font-semibold">No-shows are not tolerated at MJP Beauty.</strong> A no-show is charged <strong className="text-[#3d3530] font-semibold">the full amount of your booking</strong> to your card on file.</p>}
      />
      <QA
        q="New client: what should I expect?"
        a={
          <ol className="list-decimal list-inside space-y-2">
            <li>Once your appointment request is accepted, you'll receive a confirmation email with all appointment details.</li>
            <li>Three days before your appointment, a confirmation text will be sent to confirm your presence.</li>
            <li>Review the pre-appointment guidelines to properly prepare for your visit.</li>
          </ol>
        }
      />
      <QA
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
      <QA
        q="Pre-appointment guidelines: brow services"
        a={
          <ul className="list-disc list-inside space-y-2">
            <li>Arrive with <strong className="text-[#3d3530] font-semibold">clean brows</strong>, with no makeup or products on/around the brows. Moisturizer is okay and recommended.</li>
            <li>For Brow Lamination, <strong className="text-[#3d3530] font-semibold">avoid trimming your brows at least 3 weeks prior</strong>. We want to work with as much hair as possible.</li>
            <li>Inform Micah if you are using Retinoids, acne medications, Vitamin A products, or any skin-thinning treatments. Stop usage at least <strong className="text-[#3d3530] font-semibold">2–3 weeks prior</strong> to your appointment.</li>
          </ul>
        }
      />
      <QA
        q="Pre-appointment guidelines: lash lift services"
        a={
          <ul className="list-disc list-inside space-y-2">
            <li>Do not arrive with any makeup, especially eye makeup (mascara, concealer, foundation, eyeliner, eyeshadow).</li>
            <li>Arrive with <strong className="text-[#3d3530] font-semibold">uncurled, freshly cleaned lashes</strong>.</li>
          </ul>
        }
      />
      <div className="mt-6 bg-[#fefefe] rounded-[10px] p-4 text-sm text-[#4a403a] leading-relaxed">
        <strong className="text-[#3d3530] font-medium">Additional info:</strong> Please read the confirmation
        email after booking. It contains all details about the studio address and parking instructions.
      </div>
    </div>
  )
}

export function FaqPanel() {
  return (
    <div className="space-y-8 pt-4">
      {FAQ_DATA.map((group) => (
        <div key={group.category}>
          <h3 className="text-[15px] font-medium text-[#4a403a] pb-1">{group.category}</h3>
          {group.items.map((item) => (
            <QA key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function AftercarePanel() {
  return (
    <div>
      {AFTERCARE_DATA.map((group, i) => (
        <QA
          key={group.category}
          defaultOpen={i === 0}
          q={group.category}
          a={
            <ul className="space-y-2.5">
              {group.items.map((item, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-[#b07b5a] shrink-0" />
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
