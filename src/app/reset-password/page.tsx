'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const updatePassword = async () => {
    if (!password || password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setMessage('Updating password...')

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Password updated. Redirecting...')
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center space-y-6">
        <img
          src="/branding/made-logo.png"
          alt="A MADE MAN"
          className="mx-auto h-24 w-auto"
        />

        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            Reset Password
          </p>

          <h1 className="mt-4 text-4xl font-black">
            Set a new password.
          </h1>
        </div>

        <input
          type="password"
          placeholder="New password"
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-base outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={updatePassword}
          disabled={loading}
          className="w-full rounded-2xl bg-white py-4 font-semibold text-black disabled:opacity-60"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        {message && (
          <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            {message}
          </p>
        )}
      </section>
    </main>
  )
}