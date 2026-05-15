'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

// This page handles the redirect back from Google after OAuth
// Supabase automatically exchanges the code for a session
// We then create a profile if one doesn't exist yet

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Get the session Supabase set after the OAuth redirect
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.replace('/login')
        return
      }

      const user = session.user

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      // Create profile if this is a new Google user
      if (!existingProfile) {
        // Use Google display name if available, fall back to email prefix
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'A Made Man'

        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          display_name: displayName,
          streak_count: 1,
        })
      }

      router.replace('/dashboard')
    }

    handleCallback()
  }, [router])

  // Show nothing while processing — redirect happens fast
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-zinc-500 uppercase tracking-widest">Signing you in...</p>
      </div>
    </main>
  )
}
