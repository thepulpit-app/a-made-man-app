'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/useAuth'
import BottomNav from '../../components/BottomNav'

type Pod = {
  id: string
  name: string
  description: string | null
  invite_code: string
  created_by: string
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function PodsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [pods, setPods] = useState<Pod[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Create form
  const [showCreate, setShowCreate] = useState(false)
  const [podName, setPodName] = useState('')
  const [podDescription, setPodDescription] = useState('')
  const [creating, setCreating] = useState(false)

  // Join form
  const [showJoin, setShowJoin] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [joining, setJoining] = useState(false)

  const fetchPods = async () => {
    if (!user) return

    // Get pods the user is a member of
    const { data: memberships } = await supabase
      .from('pod_members')
      .select('pod_id')
      .eq('user_id', user.id)

    if (!memberships || memberships.length === 0) {
      setPods([])
      setLoading(false)
      return
    }

    const podIds = memberships.map((m) => m.pod_id)

    const { data, error } = await supabase
      .from('pods')
      .select('*')
      .in('id', podIds)
      .order('created_at', { ascending: false })

    if (!error && data) setPods(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPods()
  }, [user])

  const createPod = async () => {
    if (!user || !podName.trim()) {
      setMessage('Please enter a pod name.')
      return
    }

    setCreating(true)
    setMessage('')

    const code = generateInviteCode()

    const { data: newPod, error } = await supabase
      .from('pods')
      .insert({
        name: podName.trim(),
        description: podDescription.trim() || null,
        invite_code: code,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      setMessage(error.message)
      setCreating(false)
      return
    }

    // Auto-join as first member
    await supabase.from('pod_members').insert({
      pod_id: newPod.id,
      user_id: user.id,
    })

    setCreating(false)
    setShowCreate(false)
    setPodName('')
    setPodDescription('')
    setMessage('')
    fetchPods()
  }

  const joinPod = async () => {
    if (!user || !inviteCode.trim()) {
      setMessage('Please enter an invite code.')
      return
    }

    setJoining(true)
    setMessage('')

    // Find pod by invite code
    const { data: pod, error: podError } = await supabase
      .from('pods')
      .select('*')
      .eq('invite_code', inviteCode.trim().toUpperCase())
      .single()

    if (podError || !pod) {
      setMessage('Invite code not found. Check and try again.')
      setJoining(false)
      return
    }

    // Check not already a member
    const { data: existing } = await supabase
      .from('pod_members')
      .select('id')
      .eq('pod_id', pod.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      setMessage("You're already in this pod.")
      setJoining(false)
      return
    }

    // Check pod size (max 7)
    const { count } = await supabase
      .from('pod_members')
      .select('id', { count: 'exact' })
      .eq('pod_id', pod.id)

    if (count && count >= 7) {
      setMessage('This pod is full (max 7 brothers).')
      setJoining(false)
      return
    }

    const { error: joinError } = await supabase
      .from('pod_members')
      .insert({ pod_id: pod.id, user_id: user.id })

    if (joinError) {
      setMessage(joinError.message)
      setJoining(false)
      return
    }

    setJoining(false)
    setShowJoin(false)
    setInviteCode('')
    fetchPods()
    router.push(`/pods/${pod.id}`)
  }

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Brotherhood</p>
          <h1 className="mt-3 text-4xl font-black">Accountability Pods</h1>
          <p className="mt-3 text-zinc-400">
            Small groups of 5–7 men. Weekly check-ins. Private accountability.
            Real brotherhood.
          </p>
        </div>

        {/* Create / Join buttons */}
        {!showCreate && !showJoin && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-2xl bg-white py-4 font-semibold text-black"
            >
              Create a Pod
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="rounded-2xl border border-zinc-700 py-4 font-semibold"
            >
              Join a Pod
            </button>
          </div>
        )}

        {/* Create form */}
        {showCreate && (
          <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-xl font-bold">Create a Pod</h2>
            <input
              value={podName}
              onChange={(e) => setPodName(e.target.value)}
              placeholder="Pod name e.g. Iron Brotherhood"
              className="w-full rounded-2xl border border-zinc-800 bg-black p-4 outline-none"
            />
            <textarea
              value={podDescription}
              onChange={(e) => setPodDescription(e.target.value)}
              placeholder="What is this pod about? (optional)"
              className="min-h-24 w-full rounded-2xl border border-zinc-800 bg-black p-4 outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={createPod}
                disabled={creating}
                className="rounded-2xl bg-white py-3 font-semibold text-black disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create Pod'}
              </button>
              <button
                onClick={() => { setShowCreate(false); setMessage('') }}
                className="rounded-2xl border border-zinc-700 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Join form */}
        {showJoin && (
          <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-xl font-bold">Join a Pod</h2>
            <p className="text-sm text-zinc-500">
              Ask a brother already in the pod for the 6-character invite code.
            </p>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code e.g. AB12CD"
              className="w-full rounded-2xl border border-zinc-800 bg-black p-4 uppercase outline-none tracking-widest"
              maxLength={6}
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={joinPod}
                disabled={joining}
                className="rounded-2xl bg-white py-3 font-semibold text-black disabled:opacity-60"
              >
                {joining ? 'Joining...' : 'Join Pod'}
              </button>
              <button
                onClick={() => { setShowJoin(false); setMessage('') }}
                className="rounded-2xl border border-zinc-700 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            {message}
          </p>
        )}

        {/* Pods list */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-zinc-500">Loading your pods...</p>
          ) : pods.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center">
              <p className="text-zinc-400">You're not in any pods yet.</p>
              <p className="mt-2 text-sm text-zinc-600">
                Create one or ask a brother for an invite code.
              </p>
            </div>
          ) : (
            pods.map((pod) => (
              <button
                key={pod.id}
                onClick={() => router.push(`/pods/${pod.id}`)}
                className="w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-left transition-colors hover:border-zinc-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{pod.name}</h2>
                    {pod.description && (
                      <p className="mt-1 text-sm text-zinc-400">{pod.description}</p>
                    )}
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-600">
                      Code: {pod.invite_code}
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-1 flex-shrink-0 text-zinc-600">
                    <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>

      </section>
      <BottomNav />
    </main>
  )
}
