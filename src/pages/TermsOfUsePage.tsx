export default function TermsOfUsePage() {
  return (
    <main className="max-w-[780px] mx-auto px-6 md:px-12 py-20">
      <h1 className="text-3xl font-semibold text-[color:var(--foreground)] mb-2">Terms of Use</h1>
      <p className="text-sm text-[color:var(--muted-foreground)] mb-10">Last updated: May 28, 2026</p>

      <div className="prose prose-sm max-w-none text-[color:var(--foreground)] space-y-8">

        <section>
          <h2 className="text-lg font-semibold mb-2">Acceptance of Terms</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            By accessing or using the MJP Beauty website, you agree to be bound by these Terms of Use.
            If you do not agree to these terms, please do not use our website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Use of the Website</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            You agree to use this website only for lawful purposes and in a manner that does not infringe
            the rights of others. You must not use the site to transmit any harmful, offensive, or
            unauthorized content, or to engage in any activity that disrupts the functionality of the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Intellectual Property</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            All content on this website — including text, images, logos, course materials, and downloadable
            resources — is the property of MJP Beauty and is protected by copyright law. You may not
            reproduce, distribute, or use any content without prior written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Bookings and Services</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            Appointments booked through our website are subject to availability and our cancellation
            policy. We reserve the right to refuse service at our discretion. Please ensure all
            information provided during booking is accurate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Educational Content and Courses</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            Course enrollments are personal and non-transferable. All course materials are for your
            individual use only and may not be shared, resold, or redistributed. Certificates of
            completion, where applicable, are issued to the enrolled individual only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Disclaimer of Warranties</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            This website and its content are provided "as is" without warranties of any kind, either
            express or implied. MJP Beauty does not warrant that the website will be uninterrupted,
            error-free, or free of viruses or other harmful components.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Limitation of Liability</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            To the fullest extent permitted by law, MJP Beauty shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of this website or our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Changes to These Terms</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            We reserve the right to update these Terms of Use at any time. Changes will be effective
            immediately upon posting. Your continued use of the website after changes are posted
            constitutes your acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Governing Law</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            These Terms of Use are governed by the laws of the Province of Manitoba, Canada. Any disputes
            arising from the use of this website shall be subject to the exclusive jurisdiction of the
            courts of Manitoba.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Contact Us</h2>
          <p className="text-[color:var(--muted-foreground)] leading-relaxed">
            If you have any questions about these Terms of Use, please contact us at{' '}
            <a href="mailto:mjpbeauty@hotmail.com" className="text-[#827064] hover:underline">
              mjpbeauty@hotmail.com
            </a>.
          </p>
        </section>

      </div>
    </main>
  )
}
