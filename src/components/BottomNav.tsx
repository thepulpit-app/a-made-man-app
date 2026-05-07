'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/dashboard',
    label: 'Home',
  },
  {
    href: '/reflect',
    label: 'Reflect',
  },
  {
    href: '/reflections',
    label: 'Journal',
  },
  {
    href: '/resources',
    label: 'Media',
  },
  {
    href: '/community',
    label: 'Community',
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm ${
                active
                  ? 'font-semibold text-white'
                  : 'text-zinc-500'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}