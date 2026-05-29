'use client'

import { useState } from 'react'

export default function TestButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleClick() {
    setStatus('loading')
    setMessage('')

    const res = await fetch('/api/test-batch', { method: 'POST' })
    const data = await res.json()

    if (data.status === 'sent') {
      setStatus('success')
      setMessage('Check your inbox — 5 drafts on their way.')
    } else if (data.status === 'no_commits') {
      setStatus('error')
      setMessage('No substantial commits found in the last 7 days.')
    } else if (data.status === 'no_drafts') {
      setStatus('error')
      setMessage("Claude couldn't generate drafts. Try again.")
    } else {
      setStatus('error')
      setMessage(data.error ?? 'Something went wrong.')
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="bg-neutral-100 text-neutral-950 font-semibold px-6 py-3 rounded-xl hover:bg-white transition disabled:opacity-50 text-sm"
      >
        {status === 'loading' ? 'Generating drafts...' : 'Send me a test batch now'}
      </button>

      {message && (
        <p className={`mt-3 text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
