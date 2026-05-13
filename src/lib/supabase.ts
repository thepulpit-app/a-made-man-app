import { createClient } from '@supabase/supabase-js'

// The previous fix evaluated typeof window ONCE at module init time.
// If the module was first loaded server-side, storage was permanently
// set to undefined — localStorage never got used.
//
// This custom adapter checks for window on every get/set/remove call,
// so it works correctly regardless of when the module was first evaluated.

const browserStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(key)
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, value)
  },
  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  },
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'amademan-auth',
      storage: browserStorage,
    },
  }
)
