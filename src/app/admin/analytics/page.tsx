'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/useAuth'

type Stats = {
  totalUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  pushSubscribers: number
  totalPosts: number
  totalReplies: number
  totalLikes: number
  totalReflections: number
  totalPods: number
  totalPodMembers: number
  activeUsers7Days: number
  activeUsers30Days: number
}

type DailySignup = {
  date: string
  count: number
}

const ADMIN_EMAILS = ['topeajijola@hotmail.com']

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string
  value: number | string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className={`rounded-2xl border p-5 space-y-1 ${accent ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-zinc-950'}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className={`text-4xl font-black ${accent ? 'text-white' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500">{sub}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<Stats | null>(null)
  const [dailySignups, setDailySignups] = useState<DailySignup[]>([])
  const [fetching, setFetching] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (!initialized) return
    if (!loading && !user) router.push('/login')
    if (!loading && user && !ADMIN_EMAILS.includes(user.email || '')) router.push('/dashboard')
  }, [user, loading, initialized, router])

  const fetchStats = async () => {
    setFetching(true)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      { count: totalUsers },
      { count: newToday },
      { count: newWeek },
      { count: newMonth },
      { count: pushSubs },
      { count: totalPosts },
      { count: totalReplies },
      { count: totalLikes },
      { count: totalReflections },
      { count: totalPods },
      { count: totalPodMembers },
      { count: active7 },
      { count: active30 },
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
      supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }),
      supabase.from('community_posts').select('id', { count: 'exact', head: true }),
      supabase.from('post_replies').select('id', { count: 'exact', head: true }),
      supabase.from('post_likes').select('id', { count: 'exact', head: true }),
      supabase.from('saved_reflections').select('id', { count: 'exact', head: true }),
      supabase.from('pods').select('id', { count: 'exact', head: true }),
      supabase.from('pod_members').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', weekStart),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('updated_at', monthStart),
    ])

    setStats({
      totalUsers: totalUsers || 0,
      newUsersToday: newToday || 0,
      newUsersThisWeek: newWeek || 0,
      newUsersThisMonth: newMonth || 0,
      pushSubscribers: pushSubs || 0,
      totalPosts: totalPosts || 0,
      totalReplies: totalReplies || 0,
      totalLikes: totalLikes || 0,
      totalReflections: totalReflections || 0,
      totalPods: totalPods || 0,
      totalPodMembers: totalPodMembers || 0,
      activeUsers7Days: active7 || 0,
      activeUsers30Days: active30 || 0,
    })

    // Daily signups for the last 14 days
    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (recentUsers) {
      const countsByDay = new Map<string, number>()
      recentUsers.forEach((u) => {
        const day = new Date(u.created_at).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short',
        })
        countsByDay.set(day, (countsByDay.get(day) || 0) + 1)
      })

      const days: DailySignup[] = []
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        days.push({ date: label, count: countsByDay.get(label) || 0 })
      }
      setDailySignups(days)
    }

    setLastUpdated(new Date())
    setFetching(false)
  }

  useEffect(() => {
    if (user && ADMIN_EMAILS.includes(user.email || '')) {
      fetchStats()
    }
  }, [user])

  if (loading || !initialized || !stats) return null
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) return null

  const maxSignups = Math.max(...dailySignups.map((d) => d.count), 1)

  return (
    <main className="min-h-screen bg-black px-6 py-8 pb-16 text-white">
      <section className="mx-auto max-w-md space-y-8">

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Analytics</p>
            <h1 className="mt-2 text-3xl font-bold">Movement Tracker</h1>
            {lastUpdated && (
              <p className="mt-1 text-xs text-zinc-600">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={fetchStats}
            disabled={fetching}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm disabled:opacity-50"
          >
            {fetching ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Hero stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Users" value={stats.totalUsers} sub="All time registrations" accent />
          <StatCard label="Push Subscribers" value={stats.pushSubscribers} sub="Notification enabled" />
        </div>

        {/* Growth */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-3">Growth</p>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Today" value={stats.newUsersToday} />
            <StatCard label="This Week" value={stats.newUsersThisWeek} />
            <StatCard label="This Month" value={stats.newUsersThisMonth} />
          </div>
        </div>

        {/* Signups chart - last 14 days */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
            Daily Signups — Last 14 Days
          </p>
          <div className="flex items-end gap-1 h-24">
            {dailySignups.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-white transition-all"
                  style={{
                    height: `${Math.max((day.count / maxSignups) * 80, day.count > 0 ? 4 : 1)}px`,
                    opacity: day.count === 0 ? 0.15 : 1,
                  }}
                />
                {day.count > 0 && (
                  <span className="text-[9px] text-zinc-400">{day.count}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-zinc-600">{dailySignups[0]?.date}</span>
            <span className="text-[9px] text-zinc-600">{dailySignups[dailySignups.length - 1]?.date}</span>
          </div>
        </div>

        {/* Activity */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-3">Activity</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Active (7 days)" value={stats.activeUsers7Days} />
            <StatCard label="Active (30 days)" value={stats.activeUsers30Days} />
          </div>
        </div>

        {/* Community */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-3">Community</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Posts" value={stats.totalPosts} />
            <StatCard label="Replies" value={stats.totalReplies} />
            <StatCard label="Likes" value={stats.totalLikes} />
            <StatCard label="Reflections" value={stats.totalReflections} />
          </div>
        </div>

        {/* Pods */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-3">Accountability Pods</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Pods" value={stats.totalPods} />
            <StatCard label="Pod Members" value={stats.totalPodMembers} />
          </div>
        </div>

      </section>
    </main>
  )
}
