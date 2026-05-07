'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/useAuth'
import BottomNav from '../../components/BottomNav'

type SavedReflection = {
  id: string
  topic: string | null
  reflection: string
  created_at: string
}

export default function ReflectionsPage() {
  const { user } = useAuth()

  const [reflections, setReflections] = useState<SavedReflection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReflections = async () => {
      if (!user) return

      const { data } = await supabase
        .from('saved_reflections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setReflections(data)
      }

      setLoading(false)
    }

    fetchReflections()
  }, [user])

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Journal
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Saved Reflections
          </h1>

          <p className="mt-4 text-zinc-400">
            Your personal archive of reflections, lessons, thoughts,
            and moments of growth.
          </p>
        </div>

        {loading ? (
          <p className="text-zinc-500">Loading reflections...</p>
        ) : reflections.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">
              You have not saved any reflections yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reflections.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
              >
                {item.topic && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      Topic
                    </p>

                    <h2 className="mt-2 text-xl font-bold">
                      {item.topic}
                    </h2>
                  </div>
                )}

                <p className="mt-5 whitespace-pre-wrap leading-8 text-zinc-300">
                  {item.reflection}
                </p>

                <p className="mt-6 text-xs text-zinc-600">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  )
}