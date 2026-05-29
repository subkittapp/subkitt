import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { hashPassword, signSession } from '@/lib/session'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const emailClean = email.toLowerCase().trim()
    const passwordHash = hashPassword(password)

    const supabase = createServerClient()

    // Create user in users table
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: emailClean,
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Signup database error:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
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
    console.error('Signup route error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
