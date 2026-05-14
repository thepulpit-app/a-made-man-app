import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Configure VAPID — required for web push authentication
webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Same day-of-year formula used in the dashboard
// Ensures the notification matches what users see on screen
function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// GET — called by Vercel cron job daily at 7am Lagos time
// POST — called manually from the admin page for test sends
export async function GET() {
  return sendDailyPrinciple()
}

export async function POST() {
  return sendDailyPrinciple()
}

async function sendDailyPrinciple() {
  try {
    // Get today's principle
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

    // Get all push subscriptions
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

        // 410 Gone or 404 = subscription no longer valid — remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          expired.push(id)
        }
      }
    }

    // Clean up expired subscriptions
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
