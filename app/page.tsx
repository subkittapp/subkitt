'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setErrorMsg('')

    try {
      const emailClean = email.toLowerCase().trim()

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailClean,
          password,
        })

        if (error) {
          setErrorMsg(error.message)
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: emailClean,
          password,
          options: {
            // Automatically insert email/created_at to public.users via triggers, 
            // or we insert manually. Supabase Auth signs up the user in auth.users.
            // Note: Since auth.users is separate from public.users, we can insert 
            // the user details into public.users if the DB has a trigger, or do it on login.
          }
        })

        if (error) {
          setErrorMsg(error.message)
        } else {
          // If session is active immediately (email confirmation disabled)
          if (data?.session) {
            router.push('/dashboard')
            router.refresh()
          } else {
            setErrorMsg('Account created! Please check your email to confirm registration or sign in if confirmation is disabled.')
          }
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected authentication error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 selection:bg-neutral-800">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 border border-neutral-800/80 rounded-full px-3 py-1 mb-4 bg-neutral-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-neutral-400 tracking-wide">SubKitt Alpha release</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-neutral-100">SubKitt</h1>
          <p className="mt-2 text-neutral-400 text-sm">You ship. Your work turns into inbound.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 shadow-xl shadow-black/40">
          {/* Tabs */}
          <div className="flex bg-neutral-950 border border-neutral-800/60 p-1 rounded-xl mb-6">
            <button
              onClick={() => {
                setMode('login')
                setErrorMsg('')
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-neutral-800 text-neutral-100 border border-neutral-700/40' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup')
                setErrorMsg('')
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'signup' ? 'bg-neutral-800 text-neutral-100 border border-neutral-700/40' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none disabled:opacity-50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-3 text-neutral-100 placeholder:text-neutral-600 focus:outline-none disabled:opacity-50 text-sm"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-950/30 border border-red-900/60 p-3.5 rounded-xl text-red-400 text-xs leading-relaxed flex gap-2">
                <span className="font-bold">⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-100 hover:bg-white text-neutral-950 font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-sm mt-2 active:scale-[0.99]"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-neutral-600 mt-6 leading-relaxed">
          Powered by Supabase Auth.
        </p>
      </div>
    </main>
  )
}
