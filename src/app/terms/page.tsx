'use client'

import Link from 'next/link'
import BottomNav from '../../components/BottomNav'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">

        <div>
          <Link href="/more" className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Legal</p>
          <h1 className="mt-3 text-4xl font-black">Terms of Service</h1>
          <p className="mt-3 text-sm text-zinc-500">Last updated: May 2026</p>
        </div>

        <div className="space-y-6 text-zinc-300 leading-8">

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By creating an account and using A MADE MAN at app.amademan.com, you agree to
              be bound by these Terms of Service. These terms govern your use of the app and
              all related services. If you do not agree, please do not use A MADE MAN.
            </p>
            <p>
              A MADE MAN is operated by the Temitope Ajijola Empowerment and Leadership
              Foundation and powered by Sandstorm Media and Studios Limited, Lagos, Nigeria.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Who Can Use A MADE MAN</h2>
            <p>
              A MADE MAN is a men's development platform designed for men aged 18 and above.
              By using the app you confirm that you are at least 18 years old. We reserve the
              right to terminate accounts that do not meet this requirement.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Your Account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account
              credentials. You are responsible for all activity that occurs under your account.
              Notify us immediately at info@amademan.com if you suspect unauthorised use of
              your account.
            </p>
            <p>
              You may not create accounts on behalf of others or use another person's account
              without their permission.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Community Standards</h2>
            <p>
              A MADE MAN is a brotherhood community built on discipline, honesty, and respect.
              By participating in the Brotherhood Feed, Accountability Pods, and other community
              features, you agree to:
            </p>
            <ul className="space-y-2 list-none">
              {[
                'Be honest and authentic in your posts and responses',
                'Treat all members with respect regardless of background or opinion',
                'Not post content that is hateful, threatening, sexually explicit, or harmful',
                'Not harass, bully, or intimidate other members',
                'Not share another member\'s private information without their consent',
                'Not spam, advertise, or promote external products or services',
                'Not impersonate another person or misrepresent your identity',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-zinc-500 mt-1 flex-shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              We reserve the right to remove content and terminate accounts that violate these
              standards without prior notice.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Content You Post</h2>
            <p>
              You retain ownership of content you post on A MADE MAN. By posting content,
              you grant the Temitope Ajijola Empowerment and Leadership Foundation a
              non-exclusive, royalty-free licence to display and distribute that content within
              the platform.
            </p>
            <p>
              You are solely responsible for content you post. We do not endorse any user
              content and are not liable for content posted by members.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">6. Accountability Pods</h2>
            <p>
              Accountability Pod conversations are private to pod members only. You agree not
              to screenshot, share, or distribute the private responses of your pod brothers
              outside the platform without their explicit consent.
            </p>
            <p>
              What is shared in a pod stays in the pod. This is not a legal obligation — it is
              a brotherhood standard. Violation of this standard may result in removal from
              the platform.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">7. Intellectual Property</h2>
            <p>
              All original content on A MADE MAN — including daily principles, AI-generated
              reflections, branding, app design, and conference materials — is the intellectual
              property of the Temitope Ajijola Empowerment and Leadership Foundation and
              Sandstorm Media and Studios Limited.
            </p>
            <p>
              You may not copy, reproduce, distribute, or create derivative works from our
              content without written permission.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">8. AI Features</h2>
            <p>
              A MADE MAN uses artificial intelligence to generate personal reflections based
              on topics you provide. AI-generated content is for personal growth and reflection
              purposes only. It does not constitute professional counselling, mental health
              advice, financial advice, or any other regulated professional service.
            </p>
            <p>
              If you are experiencing a mental health crisis, please contact a qualified
              professional or emergency services.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">9. Availability and Changes</h2>
            <p>
              We strive to keep A MADE MAN available at all times but do not guarantee
              uninterrupted access. We may update, modify, or discontinue features of the app
              at any time. We will communicate significant changes where possible.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">10. Limitation of Liability</h2>
            <p>
              A MADE MAN is provided on an "as is" basis. To the fullest extent permitted by
              law, the Temitope Ajijola Empowerment and Leadership Foundation and Sandstorm
              Media and Studios Limited shall not be liable for any indirect, incidental, or
              consequential damages arising from your use of the platform.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">11. Termination</h2>
            <p>
              You may delete your account at any time by contacting us at info@amademan.com.
              We reserve the right to suspend or terminate accounts that violate these terms
              or our community standards.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">12. Governing Law</h2>
            <p>
              These terms are governed by the laws of the Federal Republic of Nigeria. Any
              disputes shall be resolved under Nigerian jurisdiction.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">13. Contact</h2>
            <p>For any questions about these terms, contact us at:</p>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
              <p className="font-semibold text-white">A MADE MAN</p>
              <p>Temitope Ajijola Empowerment and Leadership Foundation</p>
              <p>Lagos, Nigeria</p>
              <a href="mailto:info@amademan.com" className="text-white underline">
                info@amademan.com
              </a>
            </div>
          </div>

        </div>
      </section>
      <BottomNav />
    </main>
  )
}
