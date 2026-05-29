import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { verifySession } from '@/lib/session'
import TestButton from './test-button'

export default async function Dashboard() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('user_id')?.value
  const userId = verifySession(sessionCookie)
  if (!userId) redirect('/')

  const supabase = createServerClient()
  const { data: user } = await supabase
    .from('users')
    .select('github_username, github_email')
    .eq('id', userId)
    .single()

  if (!user) redirect('/')

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-lg mx-auto px-6 py-24">

        <div className="flex items-center gap-2 text-green-400 mb-6">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">GitHub connected</span>
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          You&apos;re in, @{user.github_username}
        </h1>
        <p className="text-neutral-400 mb-10 leading-relaxed">
          Every Monday, SubKitt reads your last 7 days of commits, filters the interesting ones, and emails 5 ready-to-post tweet drafts to{' '}
          <span className="text-neutral-200">{user.github_email}</span>.
        </p>

        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 mb-8">
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-widest text-neutral-500">What happens</h2>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex gap-3"><span className="text-neutral-600 shrink-0">→</span>Reads your GitHub commits from the past 7 days</li>
            <li className="flex gap-3"><span className="text-neutral-600 shrink-0">→</span>Filters out merges, typos, chores, tiny changes</li>
            <li className="flex gap-3"><span className="text-neutral-600 shrink-0">→</span>Claude writes 5 drafts in a direct builder&apos;s voice</li>
            <li className="flex gap-3"><span className="text-neutral-600 shrink-0">→</span>Lands in your inbox every Monday morning</li>
          </ul>
        </div>

        <div>
          <p className="text-sm text-neutral-500 mb-4">Don&apos;t want to wait until Monday?</p>
          <TestButton />
        </div>

      </div>
    </main>
  )
}
