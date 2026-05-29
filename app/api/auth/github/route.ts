import { NextResponse } from 'next/server'

export async function GET() {
  const url = new URL('https://github.com/login/oauth/authorize')
  url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!)
  url.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`)
  url.searchParams.set('scope', 'read:user user:email repo')

  return NextResponse.redirect(url.toString())
}
