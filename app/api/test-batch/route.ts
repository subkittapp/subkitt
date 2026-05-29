import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runPipeline } from '@/lib/pipeline'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userId = authUser.id
  const { data: user, error } = await supabase
    .from('users')
    .select('github_username, github_email, access_token, ai_provider, writing_tone')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const result = await runPipeline(user)
  return NextResponse.json(result)
}
