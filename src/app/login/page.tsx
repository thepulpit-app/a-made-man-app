'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const { user, initialized } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Already logged in — skip login
  useEffect(() => {
    if (initialized && user) {
      router.replace('/dashboard')
    }
  }, [initialized, user, router])

  if (!initialized || user) return null

  const handleLogin = async () => {
    setLoading(true)
    setMessage('Signing in...')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

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

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
      setGoogleLoading(false)
    }
    // No need to setGoogleLoading(false) on success
    // — the page will redirect to Google immediately
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage('Enter your email first, then click forgot password.')
      return
    }

    setLoading(true)
    setMessage('Sending reset link...')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('Reset link sent. Check your email.')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center space-y-8">

        <div className="text-center">
          <img src="/branding/made-logo.png" alt="A MADE MAN" className="mx-auto h-24 w-auto" />
          <h1 className="mt-5 text-3xl font-black">A MADE MAN</h1>
          <p className="mt-2 text-sm tracking-[0.25em] text-zinc-500">
            MEN. ADVOCACY. DIRECTION. EXCELLENCE.
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-950 py-4 font-semibold text-white transition-colors hover:border-zinc-500 disabled:opacity-60"
        >
          {googleLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.4a4.6 4.6 0 01-2 3.02v2.5h3.24c1.9-1.75 3-4.33 3-7.31z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H1.08v2.6A10 10 0 0010 20z" fill="#34A853"/>
              <path d="M4.41 11.9A6.04 6.04 0 014.1 10c0-.66.11-1.3.31-1.9V5.5H1.08A10 10 0 000 10c0 1.6.38 3.12 1.08 4.5l3.33-2.6z" fill="#FBBC05"/>
              <path d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.95.99 12.7 0 10 0A10 10 0 001.08 5.5l3.33 2.6C5.2 5.74 7.4 3.98 10 3.98z" fill="#EA4335"/>
            </svg>
          )}
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-zinc-800" />
          <span className="text-xs uppercase tracking-widest text-zinc-600">or</span>
          <div className="flex-1 border-t border-zinc-800" />
        </div>

        {/* Email / Password form */}
        <div className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 p-5">

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
              <button onClick={handleLogin} disabled={loading}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black disabled:opacity-60">
                {loading ? 'Please wait...' : 'Sign In'}
              </button>

              <button onClick={() => { setIsSigningUp(true); setMessage('') }} disabled={loading}
                className="w-full rounded-2xl border border-zinc-700 py-4 font-semibold text-white disabled:opacity-60">
                Create Account
              </button>

              <button onClick={handleForgotPassword} disabled={loading}
                className="w-full text-center text-sm text-zinc-400 underline">
                Forgot password?
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSignup} disabled={loading}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-black disabled:opacity-60">
                {loading ? 'Please wait...' : 'Create Account'}
              </button>

              <button onClick={() => { setIsSigningUp(false); setMessage(''); setFullName('') }} disabled={loading}
                className="w-full rounded-2xl border border-zinc-700 py-4 font-semibold text-white disabled:opacity-60">
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
