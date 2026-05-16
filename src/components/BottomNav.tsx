'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H14v-5h-4v5H4a1 1 0 01-1-1V9.5z"
          stroke="currentColor"
          strokeWidth={active ? '2' : '1.5'}
          fill={active ? 'currentColor' : 'none'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Reflect',
    href: '/reflect',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2a9 9 0 100 18A9 9 0 0011 2z"
          stroke="currentColor"
          strokeWidth={active ? '2' : '1.5'}
          fill={active ? 'currentColor' : 'none'}
        />
        <path
          d="M11 7v4l3 3"
          stroke={active ? 'white' : 'currentColor'}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Pods',
    href: '/pods',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3" stroke="currentColor" strokeWidth={active ? '2' : '1.5'} fill={active ? 'currentColor' : 'none'} />
        <circle cx="4" cy="14" r="2.5" stroke="currentColor" strokeWidth={active ? '2' : '1.5'} fill={active ? 'currentColor' : 'none'} />
        <circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth={active ? '2' : '1.5'} fill={active ? 'currentColor' : 'none'} />
        <path d="M7 19c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Media',
    href: '/resources',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth={active ? '2' : '1.5'} fill={active ? 'currentColor' : 'none'}/>
        <path d="M9 8.5l5 2.5-5 2.5V8.5z" fill={active ? 'white' : 'currentColor'}/>
      </svg>
    ),
  },
  {
    label: 'More',
    href: '/more',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="5" cy="11" r="1.5" fill="currentColor" />
        <circle cx="11" cy="11" r="1.5" fill="currentColor" />
        <circle cx="17" cy="11" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-900 bg-black">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const active =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 transition-colors ${
                active ? 'text-white' : 'text-zinc-600'
              }`}
            >
              {item.icon(active)}
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
