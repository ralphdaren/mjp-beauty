import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Accordion from '@/components/Accordion'
import { STUDENT_WORK } from '@/data/training'

const linkClass = 'underline underline-offset-2 text-[#3d3530] hover:text-[#827064] transition-colors duration-200'

/** Emphasised run of text inside an answer. */
function Em({ children }: { children: ReactNode }) {
  return <strong className="text-[#3d3530] font-semibold">{children}</strong>
}

/** Answer list item with the small round bullet. */
function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#827064] shrink-0" />
      <span>{children}</span>
    </li>
  )
}

const TRAINING_FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'What does the in-person training day timeline look like?',
    a: (
      <p>
        While the schedule may vary slightly for group or private training, the day typically
        includes a welcome and theory Q&amp;A, hands-on practice drills (mapping and waxing),
        lunch, <Em>Model #1</Em> (shape, tint &amp; wax), <Em>Model #2</Em> (lamination,
        shape, tint &amp; wax), followed by a final Q&amp;A, closing remarks, and certificate
        presentation.
      </p>
    ),
  },
  {
    q: 'Where are the trainings held?',
    a: (
      <div className="space-y-2">
        <p>
          All Winnipeg-based trainings are conducted at{' '}
          <Em>Standout Beauty Salon &amp; Academy</Em>, located at 186 Provencher Boulevard,
          Winnipeg, Manitoba.
        </p>
        <p>
          Additionally, Micah holds annual training sessions in Vancouver, providing opportunities
          for students in that region to attend in person. Micah travels to Vancouver once a year
          to hold trainings as well.
        </p>
      </div>
    ),
  },
  {
    q: 'Who organizes the models?',
    a: (
      <div className="space-y-3">
        <p>
          The student will have the opportunity to learn on two models to optimize the training
          experience:
        </p>
        <ul className="space-y-1">
          <Bullet><Em>Model #1:</Em> Brow Shape, Tint and Wax model</Bullet>
          <Bullet><Em>Model #2:</Em> Brow Lamination, Shape, Tint and Wax model</Bullet>
        </ul>
        <p>
          Students are responsible for sourcing their own models for the in-person training day.
          Upon receiving the training deposit, Micah will send a confirmation email containing
          detailed guidance on selecting suitable model candidates. All models must be approved by
          Micah through submission of a photo showing their natural brows.
        </p>
        <p>For students traveling from out of town, Micah can provide models upon request.</p>
      </div>
    ),
  },
  {
    q: 'When will I gain access to the online modules?',
    a: (
      <p>
        Access to the online training portion of the course will be sent to the student immediately
        once the initial deposit is received. It is the student's responsibility to complete the
        modules prior to their training day. If a student cancels within the one-month cancellation
        period, the student will lose their access to the online course immediately.
      </p>
    ),
  },
  {
    q: 'What are the payment options?',
    a: (
      <ol className="list-decimal list-inside space-y-1.5">
        <li>E-transfer</li>
        <li>Credit Card <span className="text-[#a0948a]">(subject to a processing fee)</span></li>
        <li>Payment Plan</li>
      </ol>
    ),
  },
  {
    q: 'How does the payment plan work?',
    a: (
      <div className="space-y-3">
        <p>
          Once the initial <Em>$500 non-refundable deposit</Em> has been received, the student has
          complete control on how they choose to make small incremental payments to pay off the
          remaining balance, under three conditions:
        </p>
        <ol className="list-decimal list-inside space-y-1.5">
          <li>Each payment submitted must be a minimum of <Em>$300</Em></li>
          <li>The remaining balance must be fully paid <Em>two weeks prior</Em> to the training date</li>
          <li>Can be paid via <Em>e-transfer or credit card</Em></li>
        </ol>
        <p>If this option interests you, please mention this in your submission.</p>
      </div>
    ),
  },
  {
    q: 'How does the post-training mentorship work?',
    a: (
      <p>
        You have unlimited access to trainer Micah over the following{' '}
        <Em>3 months post-training</Em> to ask any questions regarding brows! You can also submit
        up to <Em>3 model transformations</Em> which Micah will take the time to analyze, review,
        and send back personalized and detailed feedback. This is meant for you to study and
        analyze so that you can continually improve with each client! All in all, this
        post-training mentorship is meant to fast-track your career as a Brow Artist — an
        opportunity that not many trainings offer.
      </p>
    ),
  },
  {
    q: "I'm just starting out — Is this training suited for me?",
    a: (
      <p>
        Absolutely! This training was designed with beginners in mind. You'll learn everything from
        the fundamentals of brow artistry to advanced techniques, plus receive bonus business
        modules to help you confidently launch and grow your brow business from the very beginning.
      </p>
    ),
  },
  {
    q: 'Do you teach introduction to business and social media?',
    a: (
      <p>
        Yes! Along with mastering brows the MJP Beauty way, you'll receive access to bonus business
        modules inside the Online Training Portal. I cover topics like pricing for profit,
        attracting your dream clients, setting up your Instagram for success, content strategy, and
        more — so you can confidently build a profitable brow business after training. You'll also
        receive complimentary access to my social media ebook,{' '}
        <em className="text-[#3d3530]">Glam Up Your Grid</em>, where I share all of the strategies
        I used to attract my dream clientele on Instagram!
      </p>
    ),
  },
  {
    q: 'Do you travel for private or group trainings?',
    a: (
      <p>
        Yes! Due to high demand, Micah travels to Vancouver once a year to host small-group
        trainings. Join{' '}
        <Link to="/freebies" className={linkClass}>
          this email list
        </Link>{' '}
        to be the first to hear about upcoming training dates, registration, and availability.
      </p>
    ),
  },
  {
    q: "Where can I find Some of your students' work?",
    a: (
      <ul className="space-y-2.5">
        {STUDENT_WORK.map((student) => (
          <Bullet key={student.handle}>
            <Em>{student.name}</Em>{' '}
            {student.url ? (
              <a href={student.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {student.handle}
              </a>
            ) : (
              <span className="text-[#3d3530]">{student.handle}</span>
            )}{' '}
            <span className="text-[#a0948a]">({student.note})</span>
          </Bullet>
        ))}
      </ul>
    ),
  },
]

export default function TrainingFaq() {
  return (
    <div className="max-w-2xl mx-auto">
      {TRAINING_FAQ.map((item) => (
        <Accordion key={item.q} q={item.q} a={item.a} />
      ))}
    </div>
  )
}
