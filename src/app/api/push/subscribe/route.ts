import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Uses service role key to bypass RLS — this route is server-side only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { subscription, user_id } = await req.json()

    if (!subscription || !user_id) {
      return NextResponse.json(
        { error: 'Missing subscription or user_id' },
        { status: 400 }
      )
    }

    // Delete any existing subscription for this user then insert fresh
    // (handles device changes and subscription refreshes)
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user_id)

    const { error } = await supabase
      .from('push_subscriptions')
      .insert({ user_id, subscription })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[push/subscribe]', error?.message || error)
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    )
  }
}
