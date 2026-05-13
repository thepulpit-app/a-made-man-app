import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'amademan-auth',
    // FIX: explicitly point to localStorage with SSR guard
    // Without this, Next.js App Router initialises the client server-side
    // where window is undefined — Supabase silently falls back to
    // in-memory storage, so the session disappears when the tab closes
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})