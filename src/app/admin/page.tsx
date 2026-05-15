'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/useAuth'

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

type Principle = {
  id: string
  title: string
  content: string
}

type Prompt = {
  id: string
  question: string
  week_number: number
}

export default function AdminPage() {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  const adminEmails = ['topeajijola@hotmail.com', 'myteepie@gmail.com', 'salamiabiodun112@gmail.com']

  const [activeTab, setActiveTab] = useState<'principles' | 'media' | 'prompts' | 'push'>('principles')

  // Principle states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [principles, setPrinciples] = useState<Principle[]>([])

  // Resource states
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceDescription, setResourceDescription] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [resourceThumbnailUrl, setResourceThumbnailUrl] = useState('')
  const [resourceType, setResourceType] = useState('article')
  const [resourceFeatured, setResourceFeatured] = useState(false)
  const [resourceDisplaySection, setResourceDisplaySection] = useState('library')
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [uploading, setUploading] = useState(false)

  // Prompt states
  const [promptQuestion, setPromptQuestion] = useState('')
  const [promptWeek, setPromptWeek] = useState('')
  const [prompts, setPrompts] = useState<Prompt[]>([])

  // Push states
  const [pushSending, setPushSending] = useState(false)
  const [pushResult, setPushResult] = useState('')

  // Shared
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!initialized) return
    if (!loading && !user) router.push('/login')
    if (!loading && user && !adminEmails.includes(user.email || '')) router.push('/dashboard')
  }, [user, loading, initialized, router])

  const fetchResources = async () => {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
    if (data) setResources(data)
  }

  const fetchPrinciples = async () => {
    const { data } = await supabase.from('daily_principles').select('*').order('created_at', { ascending: false })
    if (data) setPrinciples(data)
  }

  const fetchPrompts = async () => {
    const { data } = await supabase.from('pod_prompts').select('*').order('week_number', { ascending: true })
    if (data) setPrompts(data)
  }

  useEffect(() => {
    fetchResources()
    fetchPrinciples()
    fetchPrompts()
  }, [])

  const addPrinciple = async () => {
    if (!title || !content) { setMessage('Please add both a title and content.'); return }
    setMessage('Saving principle...')
    const { error } = await supabase.from('daily_principles').insert([{ title, content }])
    if (error) { setMessage(error.message); return }
    setMessage('Principle added.')
    setTitle(''); setContent('')
    fetchPrinciples()
  }

  const deletePrinciple = async (id: string) => {
    if (!confirm('Delete this principle?')) return
    const { error } = await supabase.from('daily_principles').delete().eq('id', id)
    if (error) { setMessage(error.message); return }
    setMessage('Principle deleted.')
    fetchPrinciples()
  }

  const resetResourceForm = () => {
    setResourceTitle(''); setResourceDescription(''); setResourceUrl('')
    setResourceThumbnailUrl(''); setResourceType('article')
    setResourceFeatured(false); setResourceDisplaySection('library')
    setEditingResourceId(null)
  }

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from('media').upload(fileName, file)
      if (error) { setMessage(error.message); return }
      const { data } = supabase.storage.from('media').getPublicUrl(fileName)
      setResourceThumbnailUrl(data.publicUrl)
      setMessage('Image uploaded.')
    } catch { setMessage('Image upload failed.') }
    finally { setUploading(false) }
  }

  const addResource = async () => {
    setMessage('Saving resource...')
    const { error } = await supabase.from('resources').insert([{
      title: resourceTitle, description: resourceDescription, type: resourceType,
      url: resourceUrl, thumbnail_url: resourceThumbnailUrl,
      is_featured: resourceFeatured, display_section: resourceDisplaySection,
    }])
    if (error) { setMessage(error.message); return }
    setMessage('Resource added.')
    resetResourceForm(); fetchResources()
  }

  const startEditResource = (resource: Resource) => {
    setEditingResourceId(resource.id)
    setResourceTitle(resource.title || ''); setResourceDescription(resource.description || '')
    setResourceUrl(resource.url || ''); setResourceThumbnailUrl(resource.thumbnail_url || '')
    setResourceType(resource.type || 'article'); setResourceFeatured(Boolean(resource.is_featured))
    setResourceDisplaySection(resource.display_section || 'library')
    setMessage('Editing media item.')
  }

  const updateResource = async () => {
    if (!editingResourceId) return
    const { error } = await supabase.from('resources').update({
      title: resourceTitle, description: resourceDescription, type: resourceType,
      url: resourceUrl, thumbnail_url: resourceThumbnailUrl,
      is_featured: resourceFeatured, display_section: resourceDisplaySection,
    }).eq('id', editingResourceId)
    if (error) { setMessage(error.message); return }
    setMessage('Resource updated.')
    resetResourceForm(); fetchResources()
  }

  const deleteResource = async (id: string) => {
    if (!confirm('Delete this media item?')) return
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) { setMessage(error.message); return }
    setMessage('Media deleted.'); fetchResources()
  }

  const addPrompt = async () => {
    if (!promptQuestion.trim() || !promptWeek) { setMessage('Please enter a question and week number.'); return }
    setMessage('Saving prompt...')
    const { error } = await supabase.from('pod_prompts').insert([{
      question: promptQuestion.trim(),
      week_number: parseInt(promptWeek),
      is_active: false,
    }])
    if (error) { setMessage(error.message); return }
    setMessage('Prompt added.')
    setPromptQuestion(''); setPromptWeek('')
    fetchPrompts()
  }

  const deletePrompt = async (id: string) => {
    if (!confirm('Delete this prompt?')) return
    const { error } = await supabase.from('pod_prompts').delete().eq('id', id)
    if (error) { setMessage(error.message); return }
    setMessage('Prompt deleted.'); fetchPrompts()
  }

  const sendDailyPush = async () => {
    setPushSending(true); setPushResult('Sending...')
    try {
      const res = await fetch('/api/push/send', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setPushResult(`Sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}. Principle: "${data.principle}"`)
      } else {
        setPushResult(data.error || data.message || 'Something went wrong.')
      }
    } catch { setPushResult('Failed — check Vercel logs.') }
    finally { setPushSending(false) }
  }

  if (loading || !initialized) return null
  if (!user || !adminEmails.includes(user.email || '')) return null

  const tabs = ['principles', 'media', 'prompts', 'push'] as const

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <section className="mx-auto max-w-md space-y-8">

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
            <h1 className="mt-2 text-3xl font-bold">Control Room</h1>
          </div>
          {/* Analytics shortcut */}
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-white hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Analytics
          </Link>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-1">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-xl py-3 text-xs font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-white text-black' : 'text-zinc-400'
              }`}>
              {tab === 'principles' ? 'Daily' : tab === 'prompts' ? 'Pods' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* PRINCIPLES */}
        {activeTab === 'principles' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Add a Daily Principle</h2>
              <p className="mt-1 text-sm text-zinc-500">{principles.length} principle{principles.length !== 1 ? 's' : ''} in rotation</p>
            </div>
            <div className="space-y-4">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Principle title" className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none" />
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Full principle content" className="min-h-36 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none" />
              <button onClick={addPrinciple} className="w-full rounded-2xl bg-white py-3 font-semibold text-black">Add Principle</button>
            </div>
            <div className="space-y-3 border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-semibold">All Principles</h3>
              {principles.length === 0 && <p className="text-sm text-zinc-500">No principles yet.</p>}
              {principles.map((p) => (
                <div key={p.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{p.content}</p>
                  <button onClick={() => deletePrinciple(p.id)} className="mt-3 rounded-xl border border-red-900 px-3 py-2 text-sm text-red-400">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEDIA */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">{editingResourceId ? 'Edit Media Item' : 'Add Media'}</h2>
            <div className="space-y-4">
              <input value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} placeholder="Media title" className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none" />
              <textarea value={resourceDescription} onChange={(e) => setResourceDescription(e.target.value)} placeholder="Media description" className="min-h-28 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none" />
              <input value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} placeholder="Video URL (optional)" className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none" />
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-3 text-sm text-zinc-400">Upload Thumbnail</p>
                <input type="file" accept="image/*" onChange={uploadImage} />
                {uploading && <p className="mt-3 text-sm text-zinc-500">Uploading...</p>}
              </div>
              {resourceThumbnailUrl && <img src={resourceThumbnailUrl} alt="Thumbnail" className="h-52 w-full rounded-3xl object-cover" />}
              <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none">
                <option value="article">Article</option>
                <option value="replay">Conference Replay</option>
                <option value="video">Video</option>
                <option value="short">Short / Edit</option>
                <option value="podcast">Podcast Episode</option>
              </select>
              <select value={resourceDisplaySection} onChange={(e) => setResourceDisplaySection(e.target.value)} className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none">
                <option value="library">General Library</option>
                <option value="hero">Homepage Hero</option>
                <option value="conversation">Featured Conversation</option>
                <option value="shorts">Shorts Rail</option>
                <option value="replay">Conference Replay</option>
                <option value="podcast">Podcast Episode</option>
                <option value="article">Article</option>
              </select>
              <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm">
                <input type="checkbox" checked={resourceFeatured} onChange={(e) => setResourceFeatured(e.target.checked)} />
                Feature this media
              </label>
              {editingResourceId ? (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={updateResource} className="rounded-2xl bg-white py-3 font-semibold text-black">Update</button>
                  <button onClick={resetResourceForm} className="rounded-2xl border border-zinc-700 py-3">Cancel</button>
                </div>
              ) : (
                <button onClick={addResource} className="w-full rounded-2xl bg-white py-3 font-semibold text-black">Save Media</button>
              )}
            </div>
            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-semibold">All Media ({resources.length})</h3>
              {resources.map((resource) => (
                <div key={resource.id} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  {resource.thumbnail_url && <img src={resource.thumbnail_url} alt={resource.title} className="h-40 w-full rounded-2xl object-cover" />}
                  <div>
                    <p className="font-semibold">{resource.title}</p>
                    <p className="text-sm text-zinc-500">{resource.type}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-600">{resource.display_section}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => startEditResource(resource)} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm">Edit</button>
                    <button onClick={() => deleteResource(resource.id)} className="rounded-xl border border-red-900 px-3 py-2 text-sm text-red-400">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROMPTS */}
        {activeTab === 'prompts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Pod Weekly Prompts</h2>
              <p className="mt-2 text-sm text-zinc-500 leading-7">
                Add all prompts here once. The app automatically shows the right one each week based on weeks elapsed since launch (May 5, 2026). Prompts cycle endlessly.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Currently Active</p>
              <p className="text-lg font-bold">
                {prompts.length > 0
                  ? `Week ${prompts[Math.floor((Date.now() - new Date('2026-05-05').getTime()) / (7 * 24 * 60 * 60 * 1000)) % prompts.length]?.week_number} prompt`
                  : 'No prompts loaded yet'}
              </p>
            </div>
            <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <h3 className="font-semibold">Add New Prompt</h3>
              <textarea value={promptQuestion} onChange={(e) => setPromptQuestion(e.target.value)} placeholder="e.g. What's one area where you showed discipline this week?" className="min-h-28 w-full rounded-2xl border border-zinc-800 bg-black p-4 outline-none" />
              <input type="number" value={promptWeek} onChange={(e) => setPromptWeek(e.target.value)} placeholder="Week number e.g. 1" className="w-full rounded-2xl border border-zinc-800 bg-black p-4 outline-none" min="1" />
              <button onClick={addPrompt} className="w-full rounded-2xl bg-white py-3 font-semibold text-black">Add Prompt</button>
            </div>
            <div className="space-y-3 border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-semibold">All Prompts ({prompts.length})</h3>
              {prompts.length === 0 && <p className="text-sm text-zinc-500">No prompts yet.</p>}
              {prompts.map((p) => (
                <div key={p.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Week {p.week_number}</p>
                  <p className="leading-7 text-zinc-300">{p.question}</p>
                  <button onClick={() => deletePrompt(p.id)} className="mt-3 rounded-xl border border-red-900 px-3 py-2 text-sm text-red-400">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PUSH */}
        {activeTab === 'push' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Push Notifications</h2>
              <p className="mt-2 text-sm text-zinc-500 leading-7">Automatically sent at 7am Lagos time daily. Use the button below to send manually.</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Schedule</p>
              <p className="text-lg font-semibold">Every day at 7:00 AM</p>
              <p className="text-sm text-zinc-400">Lagos / West Africa Time (WAT)</p>
            </div>
            <button onClick={sendDailyPush} disabled={pushSending} className="w-full rounded-2xl bg-white py-4 font-semibold text-black disabled:opacity-60">
              {pushSending ? 'Sending...' : "Send Today's Principle Now"}
            </button>
            {pushResult && <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400 leading-7">{pushResult}</div>}
          </div>
        )}

        {message && <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm">{message}</p>}

      </section>
    </main>
  )
}
