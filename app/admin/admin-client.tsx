'use client'

import { useState } from 'react'

interface WaitlistEntry {
  id: string
  email: string
  referrer: string | null
  user_agent: string | null
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  github_username: string | null
  github_email: string | null
  ai_provider: string | null
  writing_tone: string | null
  is_admin: boolean
  updated_at: string
}

interface DraftBatch {
  id: string
  user_id: string
  drafts: string[]
  provider: string
  created_at: string
}

interface AdminClientProps {
  initialWaitlist: WaitlistEntry[]
  initialUsers: UserProfile[]
  initialBatches: DraftBatch[]
}

export default function AdminClient({ initialWaitlist, initialUsers, initialBatches }: AdminClientProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(initialWaitlist)
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const [batches, setBatches] = useState<DraftBatch[]>(initialBatches)
  const [activeTab, setActiveTab] = useState<'users' | 'waitlist' | 'batches'>('users')

  const [searchQuery, setSearchQuery] = useState('')
  const [actionStatus, setActionStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({})
  const [statusMessage, setStatusMessage] = useState<Record<string, string>>({})

  async function handleDeleteWaitlist(id: string) {
    if (!confirm('Are you sure you want to delete this waitlist entry?')) return

    try {
      const res = await fetch('/api/admin/waitlist/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setWaitlist((prev) => prev.filter((entry) => entry.id !== id))
      } else {
        alert('Failed to delete waitlist entry')
      }
    } catch (err) {
      alert('Network error')
    }
  }

  async function handleForcePipeline(userId: string) {
    setActionStatus((prev) => ({ ...prev, [userId]: 'loading' }))
    setStatusMessage((prev) => ({ ...prev, [userId]: '' }))

    try {
      const res = await fetch('/api/admin/force-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setActionStatus((prev) => ({ ...prev, [userId]: 'success' }))
        const statusText = data.result?.status === 'sent'
          ? 'Successfully generated and emailed drafts!'
          : `Pipeline ran. Result state: ${data.result?.status}`
        setStatusMessage((prev) => ({ ...prev, [userId]: statusText }))

        // Fetch refreshed batches list
        const refreshRes = await fetch('/api/test-batch') // Simple fetch trick or just ignore local append
      } else {
        setActionStatus((prev) => ({ ...prev, [userId]: 'error' }))
        setStatusMessage((prev) => ({ ...prev, [userId]: data.error || 'Failed to complete pipeline run' }))
      }
    } catch (err) {
      setActionStatus((prev) => ({ ...prev, [userId]: 'error' }))
      setStatusMessage((prev) => ({ ...prev, [userId]: 'Network error triggering pipeline' }))
    }
  }

  // Filters
  const filteredUsers = users.filter((u) =>
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.github_username || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredWaitlist = waitlist.filter((w) =>
    w.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative min-h-screen bg-[#050505] text-neutral-100 selection:bg-neutral-850 pb-20 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-neutral-900/10 blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-neutral-950/20 blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-8 z-10 relative space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-900 pb-6">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="20" height="20">
              <path
                d="M47 19 C47 13 38 11 30 13 C20 15.5 17 23 27 27.5 C41 33 44 39 37 46.5 C31 53 21 51.5 17 45"
                fill="none" stroke="white" strokeWidth="7.5" strokeLinecap="round"
              />
            </svg>
            <div>
              <h1 className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">SubKitt Console</h1>
              <p className="text-[11px] text-neutral-500">System metrics, users directories, and active logs control.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="glass border border-neutral-850 hover:bg-neutral-900 hover:border-neutral-700 text-neutral-350 hover:text-white font-medium px-4 py-2 rounded-xl transition text-xs whitespace-nowrap active:scale-[0.98]"
            >
              Dashboard
            </a>
          </div>
        </header>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between h-28 hover:border-neutral-800 transition duration-300">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">System Users</span>
            <span className="text-xl font-bold text-neutral-200">{users.length} Accounts</span>
            <span className="text-[10px] text-neutral-500">Registered dashboard profiles</span>
          </div>
          <div className="glass border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between h-28 hover:border-neutral-800 transition duration-300">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Waitlist Size</span>
            <span className="text-xl font-bold text-neutral-200">{waitlist.length} Signups</span>
            <span className="text-[10px] text-neutral-500">Pending waitlisted invitations</span>
          </div>
          <div className="glass border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between h-28 hover:border-neutral-800 transition duration-300">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Generated Batches</span>
            <span className="text-xl font-bold text-neutral-200">{batches.length} Deliveries</span>
            <span className="text-[10px] text-neutral-500">Total processed drafts batches</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
          {/* Tab switcher */}
          <div className="flex gap-2 p-1 bg-neutral-950 border border-neutral-900 rounded-xl w-fit shrink-0">
            {[
              { id: 'users', label: 'Users Directory' },
              { id: 'waitlist', label: 'Waitlist Entries' },
              { id: 'batches', label: 'Draft Deliveries' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white border border-neutral-800/80 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          {activeTab !== 'batches' && (
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'users' ? 'users by email/github...' : 'waitlist...'}`}
              className="bg-neutral-950/60 border border-neutral-900 focus:border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-200 placeholder:text-neutral-700 focus:outline-none text-xs w-full sm:max-w-xs transition"
            />
          )}
        </div>

        {/* Console Lists */}
        <main className="min-h-[400px]">
          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <div className="glass border border-neutral-900 rounded-2xl overflow-hidden animate-fadeIn">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-900 text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-950/40">
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">GitHub Connection</th>
                      <th className="px-6 py-4">AI Preferences</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-xs text-neutral-300">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-neutral-950/20 transition">
                          <td className="px-6 py-4 space-y-1">
                            <p className="font-semibold text-neutral-200">{user.email || 'No email'}</p>
                            <p className="text-[10px] text-neutral-500 font-mono">ID: {user.id}</p>
                          </td>
                          <td className="px-6 py-4">
                            {user.github_username ? (
                              <div className="space-y-0.5">
                                <p className="font-semibold text-neutral-250">@{user.github_username}</p>
                                <p className="text-[10px] text-neutral-500">{user.github_email || 'No GitHub Email'}</p>
                              </div>
                            ) : (
                              <span className="text-neutral-600 font-mono italic text-[11px]">Disconnected</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-[10px] uppercase text-neutral-450 bg-neutral-950 border border-neutral-900 px-2.5 py-1 rounded-md">
                              {user.ai_provider || 'gemini'} ({user.writing_tone || 'default'})
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-y-2">
                            <div className="flex flex-col items-end gap-1.5">
                              <button
                                onClick={() => handleForcePipeline(user.id)}
                                disabled={!user.github_username || actionStatus[user.id] === 'loading'}
                                className="bg-white hover:bg-neutral-100 disabled:opacity-30 text-neutral-950 font-bold px-4 py-2 rounded-lg text-[10px] tracking-wide transition shrink-0 active:scale-[0.98]"
                              >
                                {actionStatus[user.id] === 'loading' ? 'Running...' : 'Force Pipeline'}
                              </button>
                              
                              {statusMessage[user.id] && (
                                <p
                                  className={`text-[10px] mt-1 text-right max-w-xs ${
                                    actionStatus[user.id] === 'success' ? 'text-emerald-400' : 'text-red-400'
                                  }`}
                                >
                                  {statusMessage[user.id]}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-neutral-650 italic">No registered users matched search filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: WAITLIST */}
          {activeTab === 'waitlist' && (
            <div className="glass border border-neutral-900 rounded-2xl overflow-hidden animate-fadeIn">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-900 text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-950/40">
                      <th className="px-6 py-4">Waitlist Email</th>
                      <th className="px-6 py-4">Signup Info</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900 text-xs text-neutral-300">
                    {filteredWaitlist.length > 0 ? (
                      filteredWaitlist.map((entry) => (
                        <tr key={entry.id} className="hover:bg-neutral-950/20 transition">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-neutral-200">{entry.email}</p>
                            <p className="text-[10px] text-neutral-500 font-mono">Date: {new Date(entry.created_at).toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <p className="text-neutral-450 font-mono text-[10px]">Ref: {entry.referrer || 'direct'}</p>
                            <p className="text-[9px] text-neutral-600 max-w-sm overflow-hidden text-ellipsis whitespace-nowrap">{entry.user_agent || 'unknown'}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteWaitlist(entry.id)}
                              className="bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/40 px-3.5 py-2 rounded-lg text-[10px] font-semibold transition active:scale-[0.98]"
                            >
                              Delete Entry
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-12 text-neutral-650 italic">No waitlist entries found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DRAFT DELIVERIES LOG */}
          {activeTab === 'batches' && (
            <div className="space-y-6 animate-fadeIn">
              {batches.length > 0 ? (
                batches.map((batch) => {
                  const targetUser = users.find((u) => u.id === batch.user_id)
                  return (
                    <div key={batch.id} className="glass border border-neutral-900 rounded-2xl p-5 space-y-4 hover:border-neutral-850 transition">
                      <div className="flex justify-between items-center border-b border-neutral-900 pb-3 text-[10px] text-neutral-500 font-mono">
                        <span className="text-neutral-400 font-bold uppercase">
                          User: <b className="text-neutral-200">{targetUser?.email || batch.user_id}</b> ({batch.provider})
                        </span>
                        <span>{new Date(batch.created_at).toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        {batch.drafts.map((d, idx) => (
                          <div key={idx} className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-900/60 text-neutral-350 text-[11px] leading-relaxed">
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-16 border border-dashed border-neutral-900 rounded-2xl bg-neutral-950/20">
                  <p className="text-neutral-500 text-xs">No drafts have been logged across system users yet.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
