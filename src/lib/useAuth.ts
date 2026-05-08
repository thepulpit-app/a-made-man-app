'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (!mounted) return

      setUser(data.session?.user ?? null)
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