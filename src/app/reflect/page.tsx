'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/useAuth'
import BottomNav from '../../components/BottomNav'

export default function ReflectPage() {
  const { user } = useAuth()

  const [topic, setTopic] = useState('')
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const generateReflection = async () => {
    try {
      setLoading(true)
      setMessage('')

      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
        }),
      })

      const data = await response.json()

      setReflection(data.reflection || '')
    } catch (error) {
      setMessage('Failed to generate reflection.')
    } finally {
      setLoading(false)
    }
  }

  const saveReflection = async () => {
    if (!user || !reflection) return

    try {
      setSaving(true)
      setMessage('Saving reflection...')

      const { error } = await supabase
        .from('saved_reflections')
        .insert([
          {
            user_id: user.id,
            topic,
            reflection,
          },
        ])

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage('Reflection saved successfully.')
    } catch (error) {
      setMessage('Failed to save reflection.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Reflection
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Think deeper.
          </h1>

          <p className="mt-4 text-zinc-400">
            Explore your thoughts through guided reflections designed
            to strengthen discipline, purpose, leadership, faith, and identity.
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What are you struggling with or thinking about?"
            className="min-h-36 w-full rounded-3xl border border-zinc-800 bg-zinc-950 p-5 outline-none"
          />

          <button
            onClick={generateReflection}
            disabled={loading}
            className="w-full rounded-2xl bg-white py-4 font-semibold text-black"
          >
            {loading ? 'Generating...' : 'Generate Reflection'}
          </button>
        </div>

        {reflection && (
          <div className="space-y-5 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Reflection
              </p>

              <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-300">
                {reflection}
              </p>
            </div>

            <button
              onClick={saveReflection}
              disabled={saving}
              className="w-full rounded-2xl border border-zinc-700 py-3 text-sm font-semibold"
            >
              {saving ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            {message}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  )
}