import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Uses service role to access auth.users for accurate user count
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get total auth users — the true user count regardless of profiles
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers()
    if (authError) throw authError

    const totalUsers = authUsers.users.length

    // New users today / this week / this month
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const newToday  = authUsers.users.filter(u => u.created_at >= todayStart).length
    const newWeek   = authUsers.users.filter(u => u.created_at >= weekStart).length
    const newMonth  = authUsers.users.filter(u => u.created_at >= monthStart).length

    // Daily signups last 14 days
    const dailySignups = []
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      const count = authUsers.users.filter(u =>
        u.created_at >= dayStart.toISOString() &&
        u.created_at < dayEnd.toISOString()
      ).length
      const label = dayStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      dailySignups.push({ date: label, count })
    }

    // Active users — based on last_sign_in_at from auth.users
    const active7 = authUsers.users.filter(u =>
      u.last_sign_in_at && u.last_sign_in_at >= weekStart
    ).length

    const active30 = authUsers.users.filter(u =>
      u.last_sign_in_at && u.last_sign_in_at >= monthStart
    ).length

    return NextResponse.json({
      totalUsers,
      newToday,
      newWeek,
      newMonth,
      active7,
      active30,
      dailySignups,
    })
  } catch (error: any) {
    console.error('[admin/stats]', error?.message || error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
