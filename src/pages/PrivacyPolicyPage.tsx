export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-[780px] mx-auto px-6 md:px-12 py-20">
      <h1 className="text-3xl font-semibold text-[color:var(--foreground)] mb-2">Privacy Policy</h1>
      <p className="text-sm text-[color:var(--muted-foreground)] mb-10">Last updated: May 28, 2026</p>

      <div className="prose prose-sm max-w-none text-[color:var(--foreground)] space-y-8">

        <section>
          <h2 className="text-lg font-semibold mb-2">Information We Collect</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            We collect information you provide directly to us, such as your name, email address, and any
            details submitted through booking forms or contact inquiries. We may also collect usage data
            (pages visited, time on site) through analytics tools to improve our website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">How We Use Your Information</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            We use the information we collect to process bookings and inquiries, send confirmation and
            follow-up communications, improve our services and website experience, and comply with legal
            obligations. We do not sell or rent your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Cookies</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            Our website may use cookies to enhance your browsing experience. You can instruct your browser
            to refuse all cookies or to indicate when a cookie is being sent. Some features of our site
            may not function properly without cookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Third-Party Services</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            We use third-party platforms such as Thinkific for course delivery and booking tools for
            appointment scheduling. These services have their own privacy policies, and we encourage you
            to review them.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Data Retention</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            We retain your personal information only as long as necessary to fulfill the purposes outlined
            in this policy, unless a longer retention period is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Your Rights</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            You have the right to access, correct, or request deletion of your personal information at
            any time. To exercise these rights, please contact us at{' '}
            <a href="mailto:mjpbeauty@hotmail.com" className="text-[#827064] hover:underline">
              mjpbeauty@hotmail.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Changes to This Policy</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any significant
            changes by updating the date at the top of this page. Continued use of our website after
            changes are posted constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Contact Us</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:mjpbeauty@hotmail.com" className="text-[#827064] hover:underline">
              mjpbeauty@hotmail.com
            </a>.
          </p>
        </section>

      </div>
    </main>
  )
}
