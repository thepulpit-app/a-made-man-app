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
  is_featured: boolean | null
  created_at: string
}

function getYouTubeEmbedUrl(url: string | null) {
  if (!url) return null

  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.hostname.includes('youtube.com')) {
      const videoId = parsedUrl.searchParams.get('v')

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }

      if (parsedUrl.pathname.includes('/shorts/')) {
        const shortId = parsedUrl.pathname.split('/shorts/')[1]
        return `https://www.youtube.com/embed/${shortId}`
      }
    }

    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${videoId}`
    }

    return null
  } catch {
    return null
  }
}

function Section({
  title,
  items,
}: {
  title: string
  items: Resource[]
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>

      {items.length === 0 && (
        <p className="text-sm text-zinc-500">Nothing added yet.</p>
      )}

      {items.map((resource) => {
        const embedUrl = getMediaEmbedUrl(resource.url)

        return (
          <div
            key={resource.id}
            className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
          >
            {embedUrl ? (
              <div className="aspect-video w-full">
                <iframe
                  src={embedUrl}
                  title={resource.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : resource.thumbnail_url ? (
              <img
                src={resource.thumbnail_url}
                alt={resource.title}
                className="h-48 w-full object-cover"
              />
            ) : null}

            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                {resource.type}
              </p>

              <h3 className="mt-2 text-lg font-semibold">{resource.title}</h3>

              {resource.description && (
                <p className="mt-2 text-sm text-zinc-400">
                  {resource.description}
                </p>
              )}

              {resource.url && !embedUrl && (
                <a
                  href={resource.url}
                  target="_blank"
                  className="mt-4 inline-block text-sm underline text-zinc-300"
                >
                  Open Resource
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setResources(data)
      }
    }

    fetchResources()
  }, [])

  const featured = resources.filter((item) => item.is_featured)
  const replays = resources.filter((item) => item.type === 'replay')
  const videos = resources.filter((item) => item.type === 'video')
  const shorts = resources.filter((item) => item.type === 'short')
  const podcasts = resources.filter((item) => item.type === 'podcast')
  const articles = resources.filter((item) => item.type === 'article')

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-10">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Resources
          </p>

          <h1 className="mt-3 text-4xl font-bold">Media Hub</h1>

          <p className="mt-3 text-zinc-400">
            Conference replays, podcast conversations, videos, shorts, and
            articles for men committed to growth.
          </p>
        </div>

        {featured.length > 0 && (
          <Section title="Featured" items={featured} />
        )}

        <Section title="Conference Replays" items={replays} />
        <Section title="YouTube Videos" items={videos} />
        <div className="space-y-4">
  <h2 className="text-xl font-semibold">Shorts & Edits</h2>

  {shorts.length === 0 ? (
    <p className="text-sm text-zinc-500">No shorts added yet.</p>
  ) : (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {shorts.map((resource) => {
        const embedUrl = getMediaEmbedUrl(resource.url)

        return (
          <div
            key={resource.id}
            className="min-w-[220px] max-w-[220px] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
          >
            {embedUrl ? (
              <div className="aspect-[9/16] w-full">
                <iframe
                  src={embedUrl}
                  title={resource.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : resource.thumbnail_url ? (
              <img
                src={resource.thumbnail_url}
                alt={resource.title}
                className="aspect-[9/16] w-full object-cover"
              />
            ) : null}

            <div className="p-4">
              <h3 className="text-sm font-semibold">
                {resource.title}
              </h3>

              {resource.description && (
                <p className="mt-2 text-xs text-zinc-500 line-clamp-3">
                  {resource.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )}
</div>
        <Section title="Podcast Episodes" items={podcasts} />
        <Section title="Articles" items={articles} />
      </section>

      <BottomNav />
    </main>
  )
}