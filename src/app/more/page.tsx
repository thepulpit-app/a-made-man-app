'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/useAuth'
import BottomNav from '../../components/BottomNav'

const ADMIN_EMAILS = ['topeajijola@hotmail.com', 'myteepie@gmail.com', 'salamiabiodun112@gmail.com']

export default function MorePage() {
  const { user } = useAuth()
  const router = useRouter()

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '')

  const menuItems = [
    {
      label: 'Brotherhood Feed',
      description: 'Posts, encouragement and accountability',
      href: '/community',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M20 2H2v14h6l3 4 3-4h6V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: 'Saved Reflections',
      description: 'Your personal archive of thoughts and growth',
      href: '/reflections',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 4h14a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M7 8h8M7 11h8M7 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: 'About A MADE MAN',
      description: 'The movement, the mandate, the foundation',
      href: '/about',
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M11 10v5M11 7v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Menu</p>
          <h1 className="mt-3 text-4xl font-black">More</h1>
        </div>

        {/* Main menu items */}
        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-950 px-5 py-4 transition-colors hover:border-zinc-600"
            >
              <div className="flex items-center gap-4">
                <div className="text-zinc-400">{item.icon}</div>
                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-sm text-zinc-500">{item.description}</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-zinc-600 flex-shrink-0">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* Admin access — only visible to admin email */}
        {isAdmin && (
          <div className="space-y-3 border-t border-zinc-800 pt-6">
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Admin</p>
            <Link
              href="/admin"
              className="flex items-center justify-between rounded-3xl border border-zinc-700 bg-zinc-950 px-5 py-4 transition-colors hover:border-white"
            >
              <div className="flex items-center gap-4">
                <div className="text-zinc-400">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 2l2.5 5 5.5.8-4 3.9.9 5.5L11 14.5l-4.9 2.7.9-5.5L3 7.8 8.5 7 11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Control Room</p>
                  <p className="text-sm text-zinc-500">Manage principles, media, pods and push</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-zinc-600 flex-shrink-0">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        )}

        {/* Account info */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Signed in as</p>
          <p className="text-sm text-zinc-400">{user?.email}</p>
        </div>

        {/* Legal links */}
        <div className="flex gap-6 justify-center border-t border-zinc-800 pt-6">
          <Link href="/privacy" className="text-xs text-zinc-600 hover:text-zinc-400 underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs text-zinc-600 hover:text-zinc-400 underline">
            Terms of Service
          </Link>
        </div>

        {/* Logout */}
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
          }}
          className="w-full rounded-2xl border border-zinc-800 py-4 text-sm font-semibold text-zinc-400"
        >
          Logout
        </button>

      </section>
      <BottomNav />
    </main>
  )
}
