'use client'

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

export default function AdminPage() {
  const { user, loading, initialized } = useAuth()
  const router = useRouter()

  const adminEmails = ['topeajijola@hotmail.com']

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

  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  // FIX: track active tab so admin can switch between Principles and Media
  const [activeTab, setActiveTab] = useState<'principles' | 'media'>('principles')

  useEffect(() => {
    if (!initialized) return
    if (!loading && !user) {
      router.push('/login')
    }
    if (!loading && user && !adminEmails.includes(user.email || '')) {
      router.push('/dashboard')
    }
  }, [user, loading, initialized, router])

  const fetchResources = async () => {
    const { data } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setResources(data)
  }

  const fetchPrinciples = async () => {
    const { data } = await supabase
      .from('daily_principles')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPrinciples(data)
  }

  useEffect(() => {
    fetchResources()
    fetchPrinciples()
  }, [])

  const resetResourceForm = () => {
    setResourceTitle('')
    setResourceDescription('')
    setResourceUrl('')
    setResourceThumbnailUrl('')
    setResourceType('article')
    setResourceFeatured(false)
    setResourceDisplaySection('library')
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
      setMessage('Image uploaded successfully.')
    } catch {
      setMessage('Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // FIX: addPrinciple now works AND the UI is rendered below
  const addPrinciple = async () => {
    if (!title || !content) {
      setMessage('Please add both principle title and content.')
      return
    }
    setMessage('Saving principle...')
    const { error } = await supabase.from('daily_principles').insert([{ title, content }])
    if (error) { setMessage(error.message); return }
    setMessage('Principle added successfully.')
    setTitle('')
    setContent('')
    fetchPrinciples()
  }

  const deletePrinciple = async (id: string) => {
    const confirmed = confirm('Delete this principle?')
    if (!confirmed) return
    const { error } = await supabase.from('daily_principles').delete().eq('id', id)
    if (error) { setMessage(error.message); return }
    setMessage('Principle deleted.')
    fetchPrinciples()
  }

  const addResource = async () => {
    setMessage('Saving resource...')
    const { error } = await supabase.from('resources').insert([{
      title: resourceTitle,
      description: resourceDescription,
      type: resourceType,
      url: resourceUrl,
      thumbnail_url: resourceThumbnailUrl,
      is_featured: resourceFeatured,
      display_section: resourceDisplaySection,
    }])
    if (error) { setMessage(error.message); return }
    setMessage('Resource added successfully.')
    resetResourceForm()
    fetchResources()
  }

  const startEditResource = (resource: Resource) => {
    setEditingResourceId(resource.id)
    setResourceTitle(resource.title || '')
    setResourceDescription(resource.description || '')
    setResourceUrl(resource.url || '')
    setResourceThumbnailUrl(resource.thumbnail_url || '')
    setResourceType(resource.type || 'article')
    setResourceFeatured(Boolean(resource.is_featured))
    setResourceDisplaySection(resource.display_section || 'library')
    setMessage('Editing media item.')
  }

  const updateResource = async () => {
    if (!editingResourceId) return
    const { error } = await supabase.from('resources').update({
      title: resourceTitle,
      description: resourceDescription,
      type: resourceType,
      url: resourceUrl,
      thumbnail_url: resourceThumbnailUrl,
      is_featured: resourceFeatured,
      display_section: resourceDisplaySection,
    }).eq('id', editingResourceId)
    if (error) { setMessage(error.message); return }
    setMessage('Resource updated successfully.')
    resetResourceForm()
    fetchResources()
  }

  const deleteResource = async (id: string) => {
    const confirmed = confirm('Delete this media item?')
    if (!confirmed) return
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) { setMessage(error.message); return }
    setMessage('Media deleted.')
    fetchResources()
  }

  if (loading || !initialized) return null
  if (!user || !adminEmails.includes(user.email || '')) return null

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <section className="mx-auto max-w-md space-y-10">

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Admin</p>
          <h1 className="mt-2 text-3xl font-bold">A MADE MAN Control Room</h1>
        </div>

        {/* FIX: Tab switcher between Principles and Media */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-1">
          <button
            onClick={() => setActiveTab('principles')}
            className={`rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === 'principles'
                ? 'bg-white text-black'
                : 'text-zinc-400'
            }`}
          >
            Daily Principles
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`rounded-xl py-3 text-sm font-semibold transition-all ${
              activeTab === 'media'
                ? 'bg-white text-black'
                : 'text-zinc-400'
            }`}
          >
            Media Library
          </button>
        </div>

        {/* ── PRINCIPLES TAB ── */}
        {activeTab === 'principles' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Add a Daily Principle</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {principles.length} principle{principles.length !== 1 ? 's' : ''} in rotation
              </p>
            </div>

            <div className="space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Principle title e.g. HARD WORK IS AN ACT OF WORSHIP"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Principle content — the full reflection or statement shown to members"
                className="min-h-36 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
              />

              <button
                onClick={addPrinciple}
                className="w-full rounded-2xl bg-white py-3 font-semibold text-black"
              >
                Add Principle
              </button>
            </div>

            {/* Existing principles list */}
            <div className="space-y-3 border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-semibold">All Principles</h3>

              {principles.length === 0 && (
                <p className="text-sm text-zinc-500">No principles added yet.</p>
              )}

              {principles.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{p.content}</p>
                  <button
                    onClick={() => deletePrinciple(p.id)}
                    className="mt-3 rounded-xl border border-red-900 px-3 py-2 text-sm text-red-400"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MEDIA TAB ── */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">
              {editingResourceId ? 'Edit Media Item' : 'Add Media'}
            </h2>

            <div className="space-y-4">
              <input
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                placeholder="Media title"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
              />

              <textarea
                value={resourceDescription}
                onChange={(e) => setResourceDescription(e.target.value)}
                placeholder="Media description"
                className="min-h-28 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
              />

              <input
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="Video URL (optional)"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
              />

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="mb-3 text-sm text-zinc-400">Upload Thumbnail Image</p>
                <input type="file" accept="image/*" onChange={uploadImage} />
                {uploading && <p className="mt-3 text-sm text-zinc-500">Uploading...</p>}
              </div>

              {resourceThumbnailUrl && (
                <img
                  src={resourceThumbnailUrl}
                  alt="Thumbnail"
                  className="h-52 w-full rounded-3xl object-cover"
                />
              )}

              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
              >
                <option value="article">Article</option>
                <option value="replay">Conference Replay</option>
                <option value="video">Video</option>
                <option value="short">Short / Edit</option>
                <option value="podcast">Podcast Episode</option>
              </select>

              <select
                value={resourceDisplaySection}
                onChange={(e) => setResourceDisplaySection(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
              >
                <option value="library">General Library</option>
                <option value="hero">Homepage Hero</option>
                <option value="conversation">Featured Conversation</option>
                <option value="shorts">Shorts Rail</option>
                <option value="replay">Conference Replay</option>
                <option value="podcast">Podcast Episode</option>
                <option value="article">Article</option>
              </select>

              <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm">
                <input
                  type="checkbox"
                  checked={resourceFeatured}
                  onChange={(e) => setResourceFeatured(e.target.checked)}
                />
                Feature this media
              </label>

              {editingResourceId ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={updateResource}
                    className="rounded-2xl bg-white py-3 font-semibold text-black"
                  >
                    Update Media
                  </button>
                  <button
                    onClick={resetResourceForm}
                    className="rounded-2xl border border-zinc-700 py-3"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={addResource}
                  className="w-full rounded-2xl bg-white py-3 font-semibold text-black"
                >
                  Save Media
                </button>
              )}
            </div>

            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-semibold">
                All Media ({resources.length} items)
              </h3>

              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  {resource.thumbnail_url && (
                    <img
                      src={resource.thumbnail_url}
                      alt={resource.title}
                      className="h-40 w-full rounded-2xl object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{resource.title}</p>
                    <p className="text-sm text-zinc-500">{resource.type}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-600">
                      {resource.display_section}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { startEditResource(resource); setActiveTab('media') }}
                      className="rounded-xl border border-zinc-700 px-3 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="rounded-xl border border-red-900 px-3 py-2 text-sm text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm">
            {message}
          </p>
        )}
      </section>
    </main>
  )
}
