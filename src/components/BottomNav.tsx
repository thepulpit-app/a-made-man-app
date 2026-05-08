'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const navItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Reflect', href: '/reflect' },
    { label: 'Media', href: '/resources' },
    { label: 'Community', href: '/community' },
  ]

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {moreOpen && (
        <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            More
          </p>

          <div className="mt-4 grid gap-3">
            <Link
              href="/reflections"
              onClick={() => setMoreOpen(false)}
              className="rounded-2xl border border-zinc-800 bg-black p-4"
            >
              <p className="font-semibold">Journal</p>
              <p className="mt-1 text-sm text-zinc-500">
                Saved reflections and personal growth archive.
              </p>
            </Link>

            <Link
              href="/about"
              onClick={() => setMoreOpen(false)}
              className="rounded-2xl border border-zinc-800 bg-black p-4"
            >
              <p className="font-semibold">About</p>
              <p className="mt-1 text-sm text-zinc-500">
                The movement, foundation, and mandate behind A MADE MAN.
              </p>
            </Link>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs ${
                  active ? 'font-semibold text-white' : 'text-zinc-500'
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={`text-xs ${
              pathname === '/about' || pathname === '/reflections' || moreOpen
                ? 'font-semibold text-white'
                : 'text-zinc-500'
            }`}
          >
            More
          </button>
        </div>
      </nav>
    </>
  )
}