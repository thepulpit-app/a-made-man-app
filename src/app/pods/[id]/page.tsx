'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/useAuth'
import BottomNav from '../../../components/BottomNav'

type Pod = {
  id: string
  name: string
  description: string | null
  invite_code: string
  created_by: string
}

type Prompt = {
  id: string
  question: string
  week_number: number
}

type Response = {
  id: string
  user_id: string
  response: string
  created_at: string
  display_name: string | null
}

type Member = {
  user_id: string
  display_name: string | null
  has_responded: boolean
}

// App launch date — the week calculation starts from here.
// Every 7 days from this date, a new prompt automatically becomes active.
// Change this date if you want to reset the cycle.
const APP_LAUNCH_DATE = new Date('2026-05-05')

function getCurrentWeekIndex(totalPrompts: number): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksElapsed = Math.floor(
    (Date.now() - APP_LAUNCH_DATE.getTime()) / msPerWeek
  )
  return weeksElapsed % totalPrompts
}

export default function PodDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { user } = useAuth()
  const router = useRouter()

  const [pod, setPod] = useState<Pod | null>(null)
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [myResponse, setMyResponse] = useState('')
  const [hasResponded, setHasResponded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'prompt' | 'members'>('prompt')

  const fetchPodData = async () => {
    if (!user) return

    // Verify membership
    const { data: membership } = await supabase
      .from('pod_members')
      .select('id')
      .eq('pod_id', params.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) {
      router.push('/pods')
      return
    }

    // Fetch pod details
    const { data: podData } = await supabase
      .from('pods')
      .select('*')
      .eq('id', params.id)
      .single()

    if (podData) setPod(podData)

    // Fetch all prompts ordered by week_number
    // Auto-select the current week's prompt based on elapsed weeks since launch
    const { data: allPrompts } = await supabase
      .from('pod_prompts')
      .select('id, question, week_number')
      .order('week_number', { ascending: true })

    if (!allPrompts || allPrompts.length === 0) {
      setLoading(false)
      return
    }

    const weekIndex = getCurrentWeekIndex(allPrompts.length)
    const currentPrompt = allPrompts[weekIndex]
    setPrompt(currentPrompt)

    // Fetch responses for this prompt in this pod
    const { data: responsesData } = await supabase
      .from('pod_responses')
      .select('id, user_id, response, created_at')
      .eq('pod_id', params.id)
      .eq('prompt_id', currentPrompt.id)
      .order('created_at', { ascending: true })

    let enrichedResponses: Response[] = []

    if (responsesData && responsesData.length > 0) {
      const userIds = responsesData.map((r) => r.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds)

      const profileMap = new Map(profiles?.map((p) => [p.id, p.display_name]) || [])

      enrichedResponses = responsesData.map((r) => ({
        ...r,
        display_name: profileMap.get(r.user_id) || 'A Made Man',
      }))

      setResponses(enrichedResponses)
      setHasResponded(!!responsesData.find((r) => r.user_id === user.id))
    } else {
      setResponses([])
      setHasResponded(false)
    }

    // Fetch members
    const { data: membersData } = await supabase
      .from('pod_members')
      .select('user_id')
      .eq('pod_id', params.id)

    if (membersData) {
      const memberIds = membersData.map((m) => m.user_id)
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', memberIds)

      const profileMap = new Map(memberProfiles?.map((p) => [p.id, p.display_name]) || [])
      const respondedIds = new Set(enrichedResponses.map((r) => r.user_id))

      setMembers(membersData.map((m) => ({
        user_id: m.user_id,
        display_name: profileMap.get(m.user_id) || 'A Made Man',
        has_responded: respondedIds.has(m.user_id),
      })))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchPodData()
  }, [user, params.id])

  const submitResponse = async () => {
    if (!user || !prompt || !myResponse.trim()) {
      setMessage('Please write your response first.')
      return
    }

    setSubmitting(true)
    setMessage('')

    const { error } = await supabase.from('pod_responses').insert({
      pod_id: params.id,
      user_id: user.id,
      prompt_id: prompt.id,
      response: myResponse.trim(),
    })

    if (error) {
      setMessage(error.message)
      setSubmitting(false)
      return
    }

    setHasResponded(true)
    setMyResponse('')
    setSubmitting(false)
    fetchPodData()
  }

  if (loading) return null
  if (!pod) return null

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-6">

        <div>
          <button
            onClick={() => router.push('/pods')}
            className="mb-4 flex items-center gap-2 text-sm text-zinc-500"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            All Pods
          </button>
          <h1 className="text-4xl font-black">{pod.name}</h1>
          {pod.description && <p className="mt-2 text-zinc-400">{pod.description}</p>}
          <div className="mt-3 flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-600">Invite Code:</p>
            <p className="text-sm font-bold tracking-widest text-zinc-400">{pod.invite_code}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-1">
          {(['prompt', 'members'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-xl py-3 text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-white text-black' : 'text-zinc-400'
              }`}>
              {tab === 'prompt' ? "This Week's Check-in" : `Members (${members.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'prompt' && (
          <div className="space-y-6">
            {!prompt ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                <p className="text-zinc-400">
                  No prompts loaded yet. Add weekly prompts in the admin panel.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Week {prompt.week_number} Check-in
                  </p>
                  <h2 className="mt-4 text-2xl font-bold leading-snug">{prompt.question}</h2>
                </div>

                {!hasResponded ? (
                  <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                    <h3 className="text-lg font-semibold">Your Response</h3>
                    <p className="text-sm text-zinc-500">
                      Be honest. Your brothers are counting on the real you, not the polished version.
                    </p>
                    <textarea value={myResponse} onChange={(e) => setMyResponse(e.target.value)}
                      placeholder="Write your honest response..."
                      className="min-h-32 w-full rounded-2xl border border-zinc-800 bg-black p-4 outline-none" />
                    <button onClick={submitResponse} disabled={submitting}
                      className="w-full rounded-2xl bg-white py-3 font-semibold text-black disabled:opacity-60">
                      {submitting ? 'Submitting...' : 'Submit Response'}
                    </button>
                    {message && <p className="text-sm text-zinc-400">{message}</p>}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-zinc-700 bg-zinc-950 p-5 text-center">
                    <p className="text-sm font-semibold text-zinc-300">You've checked in this week.</p>
                    <p className="mt-1 text-sm text-zinc-500">Read your brothers' responses below.</p>
                  </div>
                )}

                {responses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                      {responses.length} Response{responses.length !== 1 ? 's' : ''} This Week
                    </h3>
                    {responses.map((r) => (
                      <div key={r.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {r.user_id === user?.id ? 'You' : r.display_name}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap leading-8 text-zinc-300">{r.response}</p>
                        <p className="mt-4 text-xs text-zinc-600">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {responses.length === 0 && hasResponded && (
                  <p className="text-center text-sm text-zinc-500">
                    You're the first to respond. Your brothers will follow.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">{members.length} of 7 spots filled</p>
            <div className="h-1 w-full rounded-full bg-zinc-800">
              <div className="h-1 rounded-full bg-white" style={{ width: `${(members.length / 7) * 100}%` }} />
            </div>
            <div className="space-y-3 pt-2">
              {members.map((member) => (
                <div key={member.user_id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold">
                      {(member.display_name || 'M')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {member.user_id === user?.id
                          ? `${member.display_name} (You)`
                          : member.display_name || 'A Made Man'}
                      </p>
                      {member.user_id === pod.created_by && (
                        <p className="text-xs text-zinc-500">Pod Creator</p>
                      )}
                    </div>
                  </div>
                  {prompt && (
                    <div className={`text-xs font-semibold uppercase tracking-wider ${
                      member.has_responded ? 'text-green-400' : 'text-zinc-600'
                    }`}>
                      {member.has_responded ? 'Checked in' : 'Pending'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Share Invite Code</p>
              <p className="text-2xl font-black tracking-widest">{pod.invite_code}</p>
              <p className="mt-2 text-xs text-zinc-600">Share this code with men you want in this pod</p>
            </div>
          </div>
        )}

      </section>
      <BottomNav />
    </main>
  )
}
