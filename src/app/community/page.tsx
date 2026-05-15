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
  like_count?: number
  reply_count?: number
  user_has_liked?: boolean
}

type Reply = {
  id: string
  author_name: string | null
  content: string
  created_at: string
  like_count?: number
  user_has_liked?: boolean
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 016.5-1.8 3.5 3.5 0 016.5 1.8c0 4-6.5 8-6.5 8z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={filled ? 'currentColor' : 'none'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ReplyCard({
  reply,
  currentUserId,
  onLikeReply,
}: {
  reply: Reply
  currentUserId: string | undefined
  onLikeReply: (replyId: string, liked: boolean) => void
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black p-4 space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          {reply.author_name || 'A MADE MAN Member'}
        </p>
        <p className="mt-2 text-sm whitespace-pre-wrap text-zinc-300 leading-6">
          {reply.content}
        </p>
        <p className="mt-2 text-xs text-zinc-600">
          {new Date(reply.created_at).toLocaleString()}
        </p>
      </div>
      {/* Like on reply */}
      <button
        onClick={() => onLikeReply(reply.id, reply.user_has_liked || false)}
        className={`flex items-center gap-1.5 text-xs transition-colors ${
          reply.user_has_liked ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
        }`}
      >
        <HeartIcon filled={reply.user_has_liked || false} />
        <span>{reply.like_count || 0}</span>
      </button>
    </div>
  )
}

function PostCard({
  post,
  currentUserId,
  onLike,
}: {
  post: CommunityPost
  currentUserId: string | undefined
  onLike: (postId: string, liked: boolean) => void
}) {
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [submittingReply, setSubmittingReply] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)

  const fetchReplies = async () => {
    setLoadingReplies(true)
    const { data } = await supabase
      .from('post_replies')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })

    if (!data) { setLoadingReplies(false); return }

    // Fetch reply likes
    const replyIds = data.map((r) => r.id)
    const [{ data: likesData }, { data: userLikesData }] = await Promise.all([
      supabase.from('reply_likes').select('reply_id').in('reply_id', replyIds),
      currentUserId
        ? supabase.from('reply_likes').select('reply_id').in('reply_id', replyIds).eq('user_id', currentUserId)
        : { data: [] },
    ])

    const likeCounts = new Map<string, number>()
    const userLikedSet = new Set<string>()
    likesData?.forEach((l) => likeCounts.set(l.reply_id, (likeCounts.get(l.reply_id) || 0) + 1))
    userLikesData?.forEach((l) => userLikedSet.add(l.reply_id))

    setReplies(data.map((r) => ({
      ...r,
      like_count: likeCounts.get(r.id) || 0,
      user_has_liked: userLikedSet.has(r.id),
    })))
    setLoadingReplies(false)
  }

  const handleShowReplies = async () => {
    if (!showReplies) await fetchReplies()
    setShowReplies(!showReplies)
  }

  const submitReply = async () => {
    if (!replyContent.trim() || !currentUserId) return
    setSubmittingReply(true)

    const { data: profileData } = await supabase
      .from('profiles').select('display_name').eq('id', currentUserId).maybeSingle()
    const displayName = profileData?.display_name || 'A MADE MAN Member'

    const { error } = await supabase.from('post_replies').insert({
      post_id: post.id,
      user_id: currentUserId,
      author_name: displayName,
      content: replyContent.trim(),
    })

    if (!error) {
      setReplyContent('')
      setShowReplyInput(false)
      fetchReplies()
      if (!showReplies) setShowReplies(true)
    }
    setSubmittingReply(false)
  }

  const handleLikeReply = async (replyId: string, alreadyLiked: boolean) => {
    if (!currentUserId) return

    if (alreadyLiked) {
      await supabase.from('reply_likes').delete()
        .eq('reply_id', replyId).eq('user_id', currentUserId)
    } else {
      await supabase.from('reply_likes').insert({ reply_id: replyId, user_id: currentUserId })
    }

    setReplies((prev) =>
      prev.map((r) =>
        r.id === replyId
          ? { ...r, user_has_liked: !alreadyLiked, like_count: alreadyLiked ? (r.like_count || 1) - 1 : (r.like_count || 0) + 1 }
          : r
      )
    )
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          {post.author_name || 'A MADE MAN Member'}
        </p>
        <p className="mt-3 whitespace-pre-wrap text-zinc-300 leading-7">{post.content}</p>
        <p className="mt-3 text-xs text-zinc-600">{new Date(post.created_at).toLocaleString()}</p>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-5 border-t border-zinc-800 pt-3">
        <button
          onClick={() => onLike(post.id, post.user_has_liked || false)}
          className={`flex items-center gap-2 text-sm transition-colors ${
            post.user_has_liked ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <HeartIcon filled={post.user_has_liked || false} />
          <span>{post.like_count || 0}</span>
        </button>

        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2.5h12v8H8l-3.5 2.5V10.5H2v-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
          <span>Reply</span>
        </button>

        {(post.reply_count || 0) > 0 && (
          <button
            onClick={handleShowReplies}
            className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showReplies ? 'Hide replies' : `${post.reply_count} ${post.reply_count === 1 ? 'reply' : 'replies'}`}
          </button>
        )}
      </div>

      {/* Reply input */}
      {showReplyInput && (
        <div className="space-y-3 border-t border-zinc-800 pt-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="min-h-20 w-full rounded-2xl border border-zinc-800 bg-black p-3 text-sm outline-none"
          />
          <div className="flex gap-2">
            <button onClick={submitReply} disabled={submittingReply || !replyContent.trim()}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
              {submittingReply ? 'Posting...' : 'Post Reply'}
            </button>
            <button onClick={() => { setShowReplyInput(false); setReplyContent('') }}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {showReplies && (
        <div className="space-y-3 border-t border-zinc-800 pt-3">
          {loadingReplies ? (
            <p className="text-xs text-zinc-500">Loading replies...</p>
          ) : replies.length === 0 ? (
            <p className="text-xs text-zinc-500">No replies yet.</p>
          ) : (
            replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                currentUserId={currentUserId}
                onLikeReply={handleLikeReply}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function CommunityPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')

  const fetchPosts = async () => {
    const { data: postsData, error } = await supabase
      .from('community_posts').select('*').order('created_at', { ascending: false })
    if (error || !postsData) return

    const postIds = postsData.map((p) => p.id)

    const [{ data: likesData }, { data: userLikesData }, { data: repliesData }] = await Promise.all([
      supabase.from('post_likes').select('post_id').in('post_id', postIds),
      user
        ? supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', user.id)
        : { data: [] },
      supabase.from('post_replies').select('post_id').in('post_id', postIds),
    ])

    const likeCounts = new Map<string, number>()
    const userLikedSet = new Set<string>()
    const replyCounts = new Map<string, number>()

    likesData?.forEach((l) => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1))
    userLikesData?.forEach((l) => userLikedSet.add(l.post_id))
    repliesData?.forEach((r) => replyCounts.set(r.post_id, (replyCounts.get(r.post_id) || 0) + 1))

    setPosts(postsData.map((p) => ({
      ...p,
      like_count: likeCounts.get(p.id) || 0,
      reply_count: replyCounts.get(p.id) || 0,
      user_has_liked: userLikedSet.has(p.id),
    })))
  }

  useEffect(() => { fetchPosts() }, [user])

  const addPost = async () => {
    setMessage('Posting...')
    if (!content) { setMessage('Please write something first.'); return }

    let displayName = 'A MADE MAN Member'
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles').select('display_name').eq('id', user.id).maybeSingle()
      if (profileData?.display_name) displayName = profileData.display_name
    }

    const { error } = await supabase.from('community_posts').insert([{ author_name: displayName, content }])
    if (error) { setMessage(error.message); return }
    setMessage(''); setContent(''); fetchPosts()
  }

  const handleLike = async (postId: string, alreadyLiked: boolean) => {
    if (!user) return
    if (alreadyLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id })
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, user_has_liked: !alreadyLiked, like_count: alreadyLiked ? (p.like_count || 1) - 1 : (p.like_count || 0) + 1 }
          : p
      )
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Community</p>
          <h1 className="mt-3 text-3xl font-bold">Brotherhood Feed</h1>
          <p className="mt-3 text-zinc-400">
            A space for principles, encouragement, accountability, and grounded brotherhood.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-xl font-semibold">Share with the Brotherhood</h2>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Write a post..."
            className="min-h-32 w-full rounded-2xl border border-zinc-800 bg-black p-4 outline-none" />
          <button onClick={addPost} className="w-full rounded-2xl bg-white py-3 font-semibold text-black">Post</button>
          {message && <p className="text-sm text-zinc-400">{message}</p>}
        </div>

        <div className="space-y-4">
          {posts.length === 0 && <p className="text-sm text-zinc-500">No posts yet.</p>}
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} onLike={handleLike} />
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  )
}
