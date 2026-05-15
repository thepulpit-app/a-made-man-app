'use client'

import Link from 'next/link'
import BottomNav from '../../components/BottomNav'

export default function PrivacyPage() {
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
          <h1 className="mt-3 text-4xl font-black">Privacy Policy</h1>
          <p className="mt-3 text-sm text-zinc-500">Last updated: May 2026</p>
        </div>

        <div className="space-y-6 text-zinc-300 leading-8">

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Who We Are</h2>
            <p>
              A MADE MAN is a men's development platform operated by the Temitope Ajijola
              Empowerment and Leadership Foundation and powered by Sandstorm Media and Studios
              Limited, Lagos, Nigeria. This privacy policy explains how we collect, use, and
              protect your personal information when you use our app at app.amademan.com.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Information We Collect</h2>
            <p>We collect the following information when you use A MADE MAN:</p>
            <ul className="space-y-2 list-none">
              {[
                'Your name and email address when you create an account',
                'Your Google profile information if you sign in with Google',
                'Content you post in the Brotherhood Feed, Accountability Pods, and Reflections',
                'Your responses to weekly pod prompts',
                'Your app activity including streak data and engagement patterns',
                'Push notification subscription tokens if you enable notifications',
                'Device and browser information for app functionality',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-zinc-500 mt-1 flex-shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="space-y-2 list-none">
              {[
                'Create and manage your account',
                'Personalise your dashboard with your name and streak data',
                'Display your posts and replies to other members of the community',
                'Send you daily principle push notifications if you have enabled them',
                'Improve the app and understand how members engage with it',
                'Respond to your support requests',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-zinc-500 mt-1 flex-shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              We do not sell your personal information to third parties. We do not use your
              data for advertising purposes.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Community Content</h2>
            <p>
              Content you post in the Brotherhood Feed and Accountability Pods is visible to
              other members of the app. Pod responses are visible only to members of your
              specific pod. Your saved reflections are private to you only.
            </p>
            <p>
              Please be mindful that content you share with the community is visible to other
              registered members. Do not share sensitive personal or financial information in
              public community posts.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Data Storage</h2>
            <p>
              Your data is stored securely using Supabase, a trusted cloud database provider.
              Data is hosted on servers in the United States. By using A MADE MAN, you consent
              to your information being stored and processed in accordance with this policy.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">6. Push Notifications</h2>
            <p>
              If you enable push notifications, we store a notification subscription token on
              your device to deliver daily principles and updates. You can disable notifications
              at any time through your device settings. Disabling notifications does not affect
              your account or access to the app.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">7. Google Sign-In</h2>
            <p>
              If you choose to sign in with Google, we receive your name and email address from
              Google. We do not access your Gmail, Google Drive, contacts, or any other Google
              services. We only request the minimum information necessary to create your account.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="space-y-2 list-none">
              {[
                'Access the personal information we hold about you',
                'Request correction of inaccurate information',
                'Request deletion of your account and associated data',
                'Withdraw consent for push notifications at any time',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-zinc-500 mt-1 flex-shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:info@amademan.com" className="text-white underline">
                info@amademan.com
              </a>
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">9. Children</h2>
            <p>
              A MADE MAN is intended for men aged 18 and above. We do not knowingly collect
              information from anyone under 18. If you believe a minor has created an account,
              please contact us and we will remove it promptly.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. When we do, we will update
              the date at the top of this page. Continued use of A MADE MAN after changes
              constitutes acceptance of the updated policy.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">11. Contact</h2>
            <p>
              For any privacy-related questions or concerns, contact us at:
            </p>
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
