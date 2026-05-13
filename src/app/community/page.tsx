'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/useAuth'
import BottomNav from '../../components/BottomNav'

type CommunityPost = {
  id: string
  author_name: string | null
  content: string
  created_at: string
}

export default function CommunityPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPosts(data)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const addPost = async () => {
    setMessage('Posting...')

    if (!content) {
      setMessage('Please write something first.')
      return
    }

    // FIX: Fetch display_name from profiles instead of using email
    let displayName = 'A MADE MAN Member'

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profileData?.display_name) {
        displayName = profileData.display_name
      }
    }

    const { error } = await supabase.from('community_posts').insert([
      {
        author_name: displayName,
        content,
      },
    ])

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Post added.')
    setContent('')
    fetchPosts()
  }

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Community
          </p>
          <h1 className="mt-3 text-3xl font-bold">Brotherhood Feed</h1>
          <p className="mt-3 text-zinc-400">
            A space for principles, encouragement, accountability, and grounded
            brotherhood.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-xl font-semibold">Share with the Brotherhood</h2>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a post..."
            className="min-h-32 w-full rounded-2xl border border-zinc-800 bg-black p-4 outline-none"
          />

          <button
            onClick={addPost}
            className="w-full rounded-2xl bg-white py-3 font-semibold text-black"
          >
            Post
          </button>

          {message && <p className="text-sm text-zinc-400">{message}</p>}
        </div>

        <div className="space-y-4">
          {posts.length === 0 && (
            <p className="text-sm text-zinc-500">No posts yet.</p>
          )}

          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {post.author_name || 'A MADE MAN Member'}
              </p>

              <p className="mt-3 whitespace-pre-wrap text-zinc-300">
                {post.content}
              </p>

              <p className="mt-4 text-xs text-zinc-600">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  )
}
