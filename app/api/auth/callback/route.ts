import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(`${APP_URL}/?error=no_code`)

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })
  const { access_token } = await tokenRes.json()
  if (!access_token) return NextResponse.redirect(`${APP_URL}/?error=no_token`)

  // Fetch GitHub user info
  const [userRes, emailRes] = await Promise.all([
    fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/vnd.github.v3+json' },
    }),
    fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/vnd.github.v3+json' },
    }),
  ])

  if (!userRes.ok || !emailRes.ok) {
    console.error('GitHub API error user:', userRes.status, 'email:', emailRes.status)
    return NextResponse.redirect(`${APP_URL}/?error=github_api_error`)
  }

  const githubUser = await userRes.json()
  const emails = await emailRes.json()

  if (!githubUser || !githubUser.id) {
    return NextResponse.redirect(`${APP_URL}/?error=github_user_error`)
  }

  const primaryEmail = Array.isArray(emails)
    ? (emails.find((e: any) => e.primary)?.email ?? null)
    : null

  const supabase = await createClient()
  
  // Check if there is an active Supabase Auth session to link the GitHub account to
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const loggedInUserId = authUser?.id

  let user: any = null
  let dbError: any = null

  if (loggedInUserId) {
    // User is logged in, update their existing record to link GitHub
    const { data, error } = await supabase
      .from('users')
      .update({
        github_id: githubUser.id,
        github_username: githubUser.login,
        github_email: primaryEmail,
        access_token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', loggedInUserId)
      .select()
      .single()

    user = data
    dbError = error
  } else {
    // Legacy flow: standard upsert based on github_id conflict
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          github_id: githubUser.id,
          github_username: githubUser.login,
          github_email: primaryEmail,
          access_token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'github_id' }
      )
      .select()
      .single()

    user = data
    dbError = error
  }

  if (dbError || !user) {
    console.error('Supabase update/upsert error:', dbError)
    return NextResponse.redirect(`${APP_URL}/?error=db_error`)
  }

  return NextResponse.redirect(`${APP_URL}/dashboard`)
}
