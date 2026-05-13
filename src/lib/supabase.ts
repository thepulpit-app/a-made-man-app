import { createBrowserClient } from '@supabase/ssr'

// FIX: Use createBrowserClient from @supabase/ssr instead of createClient
// from @supabase/supabase-js. This handles session persistence correctly
// in Next.js App Router by using cookies, which work across server and
// client contexts — unlike localStorage which is unavailable server-side.
//
// Run this before deploying: npm install @supabase/ssr

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
