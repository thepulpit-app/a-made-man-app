'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')  // FIX: added display name field
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setMessage('Signing in...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleSignup = async () => {
    if (!fullName.trim()) {
      setMessage('Please enter your full name.')
      return
    }

    setLoading(true)
    setMessage('Creating account...')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    // FIX: Use the actual full name entered, not email prefix
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        display_name: fullName.trim(),
        streak_count: 1,
      })
    }

    setMessage('Account created. Check your email if confirmation is required.')
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage('Enter your email first, then click forgot password.')
      return
    }

    setLoading(true)
    setMessage('Sending password reset link...')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Password reset link sent. Check your email.')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center space-y-8">
        <div className="text-center">
          <img
            src="/branding/made-logo.png"
            alt="A MADE MAN"
            className="mx-auto h-24 w-auto"
          />

          <h1 className="mt-5 text-3xl font-black">A MADE MAN</h1>

          <p className="mt-2 text-sm tracking-[0.25em] text-zinc-500">
            MEN. ADVOCACY. DIRECTION. EXCELLENCE.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">

          {/* FIX: Full name field — shown only when signing up */}
          {isSigningUp && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-base outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-base outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-zinc-800 bg-black p-4 text-base outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {!isSigningUp ? (
            <>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black disabled:opacity-60"
              >
                {loading ? 'Please wait...' : 'Sign In'}
              </button>

              <button
                onClick={() => {
                  setIsSigningUp(true)
                  setMessage('')
                }}
                disabled={loading}
                className="w-full rounded-2xl border border-zinc-700 py-4 font-semibold text-white disabled:opacity-60"
              >
                Create Account
              </button>

              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full text-center text-sm text-zinc-400 underline"
              >
                Forgot password?
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black disabled:opacity-60"
              >
                {loading ? 'Please wait...' : 'Create Account'}
              </button>

              <button
                onClick={() => {
                  setIsSigningUp(false)
                  setMessage('')
                  setFullName('')
                }}
                disabled={loading}
                className="w-full rounded-2xl border border-zinc-700 py-4 font-semibold text-white disabled:opacity-60"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>

        {message && (
          <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm text-zinc-400">
            {message}
          </p>
        )}
      </section>
    </main>
  )
}
