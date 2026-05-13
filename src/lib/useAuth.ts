'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

// Race condition in the previous version:
// onAuthStateChange fires an INITIAL_SESSION event almost immediately
// after setup — sometimes BEFORE getSession() / getUser() completes.
// If it fires with null first, initialized becomes true with no user,
// and protected pages redirect to login before the real session loads.
//
// Fix: use a ref to track whether our own loadSession() has completed.
// onAuthStateChange only processes events AFTER that — so INITIAL_SESSION
// is ignored, but SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED still work.

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const sessionLoaded = useRef(false)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!mounted) return

      setUser(session?.user ?? null)
      setLoading(false)
      setInitialized(true)
      sessionLoaded.current = true
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      // Skip INITIAL_SESSION — let loadSession() handle the first state.
      // Process everything else: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED etc.
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
