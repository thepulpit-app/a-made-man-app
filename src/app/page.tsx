'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getMediaEmbedUrl } from '../lib/media'

type Resource = {
  id: string
  title: string
  description: string | null
  type: string
  url: string | null
  thumbnail_url: string | null
  is_featured: boolean | null
  display_section: string | null
}

function MediaFrame({
  item,
  tall = false,
}: {
  item: Resource
  tall?: boolean
}) {
  const embedUrl = getMediaEmbedUrl(item.url)

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
      {embedUrl ? (
        <div className={tall ? 'aspect-[9/16] w-full' : 'aspect-video w-full'}>
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
          className={
            tall
              ? 'aspect-[9/16] w-full object-cover'
              : 'h-56 w-full object-cover'
          }
        />
      ) : null}

      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          {item.type}
        </p>

        <h3 className="mt-2 text-xl font-bold">{item.title}</h3>

        {item.description && (
          <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
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

  const hero = resources.find((item) => item.display_section === 'hero')
  const conversation = resources.find(
    (item) => item.display_section === 'conversation'
  )

  const shorts = resources.filter((item) => item.display_section === 'shorts')
  const replays = resources.filter((item) => item.display_section === 'replay')
  const podcasts = resources.filter((item) => item.display_section === 'podcast')

  const heroEmbed = getMediaEmbedUrl(hero?.url || null)

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-6 pb-16 pt-8">
        <div className="mx-auto max-w-md space-y-8">
          <div className="flex items-center gap-4">
            <img
              src="/branding/made-logo.png"
              alt="A MADE MAN"
              className="h-16 w-auto"
            />

            <div>
              <p className="text-sm uppercase tracking-[0.5em] text-zinc-400">
                A MADE MAN
              </p>

              <p className="text-xs text-zinc-500">
                MEN. ADVOCACY. DIRECTION. EXCELLENCE.
              </p>
            </div>
          </div>

          {hero && (
            <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl">
              {heroEmbed ? (
                <div className="aspect-[4/5] w-full">
                  <iframe
                    src={heroEmbed}
                    title={hero.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : hero.thumbnail_url ? (
                <img
                  src={hero.thumbnail_url}
                  alt={hero.title}
                  className="aspect-[4/5] w-full object-cover object-top"
                />
              ) : null}
            </div>
          )}

          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
              The Movement
            </p>

            <h1 className="mt-4 text-5xl font-black leading-none">
              Build the man you were meant to become.
            </h1>

            <p className="mt-6 max-w-sm text-lg text-zinc-300">
              Discipline. Responsibility. Brotherhood. Legacy.
            </p>

            {hero && (
              <div className="mt-6 border-l-2 border-zinc-700 pl-4">
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                  Featured
                </p>

                <p className="mt-2 text-lg font-semibold">{hero.title}</p>

                {hero.description && (
                  <p className="mt-2 text-sm text-zinc-400">
                    {hero.description}
                  </p>
                )}
              </div>
            )}

            <div className="mt-10 grid grid-cols-2 gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-black"
              >
                Enter App
              </Link>

              <Link
                href="/resources"
                className="rounded-2xl border border-zinc-700 px-6 py-4 text-center font-semibold"
              >
                Watch
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900 px-6 py-16">
        <div className="mx-auto max-w-md">
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            The Movement
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Conversations that build men.
          </h2>

          <p className="mt-6 text-zinc-400">
            Conference sessions. Brotherhood conversations. Podcast episodes.
            Real principles for real men navigating purpose, pressure,
            leadership, faith, family, and legacy.
          </p>
        </div>
      </section>

      {conversation && (
        <section className="border-t border-zinc-900 px-6 py-16">
          <div className="mx-auto max-w-md space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
                Conversations
              </p>

              <h2 className="mt-4 text-4xl font-bold">
                Featured Conversation
              </h2>

              <p className="mt-4 text-zinc-400">
                Honest conversations about leadership, discipline, masculinity,
                family, pressure, purpose, and legacy.
              </p>
            </div>

            <MediaFrame item={conversation} />
          </div>
        </section>
      )}

      {shorts.length > 0 && (
        <section className="border-t border-zinc-900 px-6 py-16">
          <div className="mx-auto max-w-md space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
                Shorts
              </p>

              <h2 className="mt-4 text-4xl font-bold">Shorts & Edits</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {shorts.map((item) => (
                <div key={item.id} className="min-w-[220px] max-w-[220px]">
                  <MediaFrame item={item} tall />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {replays.length > 0 && (
        <section className="border-t border-zinc-900 px-6 py-16">
          <div className="mx-auto max-w-md space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
                Conference
              </p>

              <h2 className="mt-4 text-4xl font-bold">Conference Replays</h2>
            </div>

            <div className="space-y-6">
              {replays.slice(0, 3).map((item) => (
                <MediaFrame key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {podcasts.length > 0 && (
        <section className="border-t border-zinc-900 px-6 py-16">
          <div className="mx-auto max-w-md space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
                Podcast
              </p>

              <h2 className="mt-4 text-4xl font-bold">Studio Episodes</h2>
            </div>

            <div className="space-y-6">
              {podcasts.slice(0, 3).map((item) => (
                <MediaFrame key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-zinc-900 px-6 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-3xl font-bold">Enter the brotherhood.</h2>

          <p className="mt-4 text-zinc-400">
            Access daily principles, AI reflections, resources, conversations,
            and community built for men becoming who they were meant to be.
          </p>

          <Link
            href="/login"
            className="mt-8 block rounded-2xl bg-white py-4 text-center font-semibold text-black"
          >
            Enter App
          </Link>
        </div>
      </section>
    </main>
  )
}