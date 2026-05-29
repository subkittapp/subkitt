import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { signSession } from '@/lib/session'

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

  // Upsert user in Supabase
  const supabase = createServerClient()
  const { data: user, error } = await supabase
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

  if (error || !user) {
    console.error('Supabase upsert error:', error)
    return NextResponse.redirect(`${APP_URL}/?error=db_error`)
  }

  const response = NextResponse.redirect(`${APP_URL}/dashboard`)
  const signedSessionVal = signSession(user.id)
  response.cookies.set('user_id', signedSessionVal, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}
