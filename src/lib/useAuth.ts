'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// FIX: Uses getUser() instead of getSession() for reliability with @supabase/ssr.
// getSession() reads from cache and can return stale/null data after a tab close.
// getUser() verifies the session against the server — always accurate.

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!mounted) return

      setUser(user ?? null)
      setLoading(false)
      setInitialized(true)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      setUser(session?.user ?? null)
      setLoading(false)
      setInitialized(true)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, initialized }
}
