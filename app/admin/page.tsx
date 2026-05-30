import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import AdminClient from './admin-client'

export default async function AdminPage() {
  const supabase = createServerClient()
  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !authUser) {
    redirect('/')
  }

  // Check admin rights
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', authUser.id)
    .single()

  const isAuthorized = authUser.email === 'febcheema@gmail.com' || profile?.is_admin === true

  if (!isAuthorized) {
    redirect('/dashboard')
  }

  // Fetch metrics and tables concurrently
  const [waitlistRes, usersRes, batchesRes] = await Promise.all([
    supabase.from('waitlist').select('*').order('created_at', { ascending: false }),
    supabase.from('users').select('*').order('updated_at', { ascending: false }),
    supabase.from('draft_batches').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-850">
      <AdminClient
        initialWaitlist={waitlistRes.data || []}
        initialUsers={usersRes.data || []}
        initialBatches={batchesRes.data || []}
      />
    </main>
  )
}
