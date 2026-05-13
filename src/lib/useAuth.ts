'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

// Root cause confirmed: the session IS in localStorage (amademan-auth key).
// The problem is that getSession() fails to pick it up when the Supabase
// client re-initialises in a new tab — likely a timing/init issue in
// @supabase/supabase-js on Next.js App Router.
//
// Fix: read the tokens directly from localStorage ourselves, then call
// setSession() to explicitly hand them to the Supabase client.
// If the access_token is expired, Supabase will auto-refresh it using
// the refresh_token before returning. No storage adapter required.

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const sessionLoaded = useRef(false)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      // Step 1: Read tokens directly from localStorage
      // Bypass the Supabase storage adapter entirely
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('amademan-auth')

        if (stored) {
          try {
            const parsed = JSON.parse(stored)

            if (parsed?.access_token && parsed?.refresh_token) {
              // Explicitly give Supabase the stored tokens.
              // This works even if access_token is expired —
              // Supabase uses refresh_token to silently get a new one.
              await supabase.auth.setSession({
                access_token: parsed.access_token,
                refresh_token: parsed.refresh_token,
              })
            }
          } catch {
            // Malformed storage value — fall through to getSession below
          }
        }
      }

      // Step 2: Get the now-confirmed session (refreshed if needed)
      const { data: { session } } = await supabase.auth.getSession()

      if (!mounted) return

      setUser(session?.user ?? null)
      setLoading(false)
      setInitialized(true)
      sessionLoaded.current = true
    }

    loadSession()

    // Only process auth changes AFTER our own loadSession() completes.
    // This prevents the INITIAL_SESSION event from racing ahead with null
    // and triggering a redirect before the stored session is restored.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (!sessionLoaded.current) return

      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, initialized }
}
