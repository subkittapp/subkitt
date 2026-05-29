import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export default async function Dashboard() {
  const supabase = await createClient()

  // Get current authenticated user session
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !authUser) {
    redirect('/')
  }

  // Retrieve public profile row
  let { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('github_username, github_email, ai_provider, writing_tone')
    .eq('id', authUser.id)
    .single()

  // Self-healing: Create the public.users row if missing
  if (profileError || !userProfile) {
    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email || '',
        updated_at: new Date().toISOString(),
      })
      .select('github_username, github_email, ai_provider, writing_tone')
      .single()

    if (createError || !newProfile) {
      console.error('Error auto-creating user profile:', createError)
      redirect('/')
    }
    userProfile = newProfile
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800">
      <DashboardClient initialUser={userProfile} />
    </main>
  )
}
