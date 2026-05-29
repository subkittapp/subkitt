import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { hashPassword, signSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const emailClean = email.toLowerCase().trim()
    const passwordHash = hashPassword(password)

    const supabase = createServerClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', emailClean)
      .eq('password_hash', passwordHash)
      .maybeSingle()

    if (error) {
      console.error('Login database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true, user })
    const signedSessionVal = signSession(user.id)
    response.cookies.set('user_id', signedSessionVal, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Login route error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
