'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'
import { getMediaEmbedUrl } from '../../lib/media'

type Resource = {
  id: string
  title: string
  description: string | null
  type: string
  url: string | null
  thumbnail_url: string | null
  display_section: string | null
}

function ResourceCard({ item }: { item: Resource }) {
  const embedUrl = getMediaEmbedUrl(item.url)

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
      {item.type === 'image' && item.thumbnail_url ? (
        <img
          src={item.thumbnail_url}
          alt={item.title}
          className="w-full object-cover"
        />
      ) : embedUrl ? (
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={item.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : item.thumbnail_url ? (
        <img
          src={item.thumbnail_url}
          alt={item.title}
          className="h-56 w-full object-cover"
        />
      ) : null}

      <div className="space-y-3 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          {item.type}
        </p>

        <h2 className="text-2xl font-bold">
          {item.title}
        </h2>

        {item.description && (
          <p className="text-sm leading-7 text-zinc-400">
            {item.description}
          </p>
        )}

        {item.url &&
          item.type !== 'video' &&
          item.type !== 'podcast' &&
          item.type !== 'short' && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 text-sm font-semibold"
            >
              Open Resource
            </a>
          )}
      </div>
    </div>
  )
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setResources(data)
      }

      setLoading(false)
    }

    fetchResources()
  }, [])

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Resources
          </p>

          <h1 className="mt-4 text-5xl font-black leading-none">
            Media Library
          </h1>

          <p className="mt-5 text-zinc-400">
            Conversations, conference sessions, teachings,
            shorts, articles, and visuals designed to help
            men grow intentionally.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-500">Loading resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-500">
              No resources available yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {resources.map((item) => (
              <ResourceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  )
}