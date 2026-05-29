import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { runPipeline } from '@/lib/pipeline'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data: users, error } = await supabase
    .from('users')
    .select('github_username, github_email, access_token')
    .not('access_token', 'is', null)
    .not('github_email', 'is', null)

  if (error || !users) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  const results = await Promise.all(
    users.map(async user => ({
      user: user.github_username,
      ...(await runPipeline(user)),
    }))
  )

  return NextResponse.json({ processed: results.length, results })
}
