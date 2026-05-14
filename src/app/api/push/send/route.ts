import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Prevent Next.js from statically analysing this route at build time
// The web-push library needs env vars that are only available at runtime
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export async function GET() {
  return sendDailyPrinciple()
}

export async function POST() {
  return sendDailyPrinciple()
}

async function sendDailyPrinciple() {
  try {
    // Configure VAPID inside the function — not at module level
    // This ensures env vars are available at runtime, not build time
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    const { data: principles, error: principlesError } = await supabase
      .from('daily_principles')
      .select('title, content')

    if (principlesError) throw principlesError

    if (!principles || principles.length === 0) {
      return NextResponse.json(
        { error: 'No principles in database' },
        { status: 404 }
      )
    }

    const todayIndex = getDayOfYear() % principles.length
    const principle = principles[todayIndex]

    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('id, subscription')

    if (subsError) throw subsError

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscribers yet', sent: 0 })
    }

    const payload = JSON.stringify({
      title: "Today's Principle",
      body: principle.title,
      url: '/dashboard',
    })

    let sent = 0
    let failed = 0
    const expired: string[] = []

    for (const { id, subscription } of subscriptions) {
      try {
        await webpush.sendNotification(subscription, payload)
        sent++
      } catch (err: any) {
        failed++
        console.error(`[push/send] failed for ${id}:`, err?.statusCode)
        if (err.statusCode === 410 || err.statusCode === 404) {
          expired.push(id)
        }
      }
    }

    if (expired.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', expired)
    }

    console.log(`[push/send] sent: ${sent}, failed: ${failed}, cleaned: ${expired.length}`)

    return NextResponse.json({
      success: true,
      principle: principle.title,
      sent,
      failed,
      cleaned: expired.length,
    })
  } catch (error: any) {
    console.error('[push/send] error:', error?.message || error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}