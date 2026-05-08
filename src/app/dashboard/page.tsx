'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/useAuth'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'
import { getMediaEmbedUrl } from '../../lib/media'

type Principle = {
  title: string
  content: string
}

type Profile = {
  streak_count: number | null
  display_name: string | null
}

type Resource = {
  id: string
  title: string
  description: string | null
  type: string
  url: string | null
  thumbnail_url: string | null
  display_section: string | null
}

export default function DashboardPage() {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  const [principle, setPrinciple] = useState<Principle | null>(null)

  const [profile, setProfile] = useState<Profile | null>(null)

  const [featuredConversation, setFeaturedConversation] =
    useState<Resource | null>(null)

 useEffect(() => {
  if (initialized && !loading && !user) {
    router.push('/login')
  }
}, [user, loading, initialized, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      //------------------------------------
      // RANDOM DAILY PRINCIPLE
      //------------------------------------

      const { data: principles } = await supabase
        .from('daily_principles')
        .select('*')

      if (principles && principles.length > 0) {
        const today = new Date().getDate()

        const randomIndex = today % principles.length

        setPrinciple(principles[randomIndex])
      }

      //------------------------------------
      // STREAK SYSTEM
      //------------------------------------

      await supabase.rpc('update_user_streak', {
        user_uuid: user.id,
      })

      const { data: profileData } = await supabase
        .from('profiles')
        .select('streak_count, display_name')
        .eq('id', user.id)
       .maybeSingle()

      if (profileData) {
        setProfile(profileData)
      }

      //------------------------------------
      // FEATURED CONVERSATION
      //------------------------------------

      const { data: media } = await supabase
        .from('resources')
        .select('*')
        .eq('display_section', 'conversation')
        .limit(1)

      if (media && media.length > 0) {
        setFeaturedConversation(media[0])
      }
    }

    fetchDashboardData()
  }, [user])

  if (loading || !initialized) return null

  const featuredEmbed = getMediaEmbedUrl(
    featuredConversation?.url || null
  )

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <img
              src="/branding/made-logo.png"
              alt="A MADE MAN"
              className="h-16 w-auto"
            />

            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
                A MADE MAN
              </p>

              <p className="text-xs text-zinc-600">
                MEN. ADVOCACY. DIRECTION. EXCELLENCE.
              </p>
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-black leading-tight">
              Welcome back.
            </h1>

            <p className="mt-3 text-zinc-400">
              Keep building the man you were meant to become.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Discipline Streak
              </p>

              <h2 className="mt-3 text-5xl font-black">
                {profile?.streak_count || 1}
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Consecutive days showing up intentionally.
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Brotherhood
              </p>

              <h2 className="mt-3 text-5xl font-black">
                500+
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Men impacted through the movement.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Today’s Principle
          </p>

          <h2 className="mt-4 text-3xl font-bold">
            {principle?.title || 'Loading principle...'}
          </h2>

          <p className="mt-5 leading-8 text-zinc-300">
            {principle?.content || ''}
          </p>
        </div>

        {featuredConversation && (
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
            {featuredEmbed && (
              <div className="aspect-video w-full">
                <iframe
                  src={featuredEmbed}
                  title={featuredConversation.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}

            {!featuredEmbed &&
              featuredConversation.thumbnail_url && (
                <img
                  src={featuredConversation.thumbnail_url}
                  alt={featuredConversation.title}
                  className="h-60 w-full object-cover"
                />
              )}

            <div className="space-y-3 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Featured Conversation
              </p>

              <h2 className="text-2xl font-bold">
                {featuredConversation.title}
              </h2>

              {featuredConversation.description && (
                <p className="text-zinc-400">
                  {featuredConversation.description}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Your Identity
          </p>

          <h2 className="mt-4 text-2xl font-bold">
            {profile?.display_name || 'Made Man'}
          </h2>

          <p className="mt-3 text-zinc-400">
            You are building discipline, responsibility,
            leadership, faith, consistency, and legacy one day
            at a time.
          </p>

          <p className="mt-5 text-sm text-zinc-600">
            Signed in as {user?.email}
          </p>
        </div>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/login')
          }}
          className="w-full rounded-2xl border border-zinc-700 py-4 text-sm font-semibold"
        >
          Logout
        </button>
      </section>

      <BottomNav />
    </main>
  )
}