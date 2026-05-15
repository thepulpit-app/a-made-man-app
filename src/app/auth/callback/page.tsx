'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.replace('/login')
        return
      }

      const user = session.user

      // Build display name from Google metadata
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'A Made Man'

      // Check if profile exists AND has a display name
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingProfile) {
        // New user — create full profile
        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          display_name: displayName,
          streak_count: 1,
        })
      } else if (!existingProfile.display_name) {
        // Profile exists but display_name is null — update it
        await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', user.id)
      }

      router.replace('/dashboard')
    }

    handleCallback()
  }, [router])

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-zinc-500 uppercase tracking-widest">Signing you in...</p>
      </div>
    </main>
  )
}
