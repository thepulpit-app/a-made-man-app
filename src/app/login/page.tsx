'use client'

import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    setMessage('Signing in...')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Signed in successfully')
    router.push('/dashboard')
  }

  const handleSignup = async () => {
    setMessage('Creating account...')

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Account created. Now click Sign In.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
  <img
    src="/branding/made-logo.png"
    alt="A MADE MAN"
    className="mx-auto h-50 w-auto"
  />

  <h1 className="mt-4 text-2xl font-bold">A MADE MAN</h1>

  <p className="mt-2 text-sm text-zinc-500">
    MEN. ADVOCACY. DIRECTION. EXCELLENCE.
  </p>
</div>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-white text-black py-3 rounded font-semibold"
        >
          Sign In
        </button>

        <button
          onClick={handleSignup}
          className="w-full border border-white py-3 rounded font-semibold"
        >
          Create Account
        </button>

        {message && (
          <p className="text-center text-sm text-gray-300">{message}</p>
        )}
      </div>
    </div>
  )
}