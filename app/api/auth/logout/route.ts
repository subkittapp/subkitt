import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Error signing out:', err)
  }

  const response = NextResponse.redirect(`${APP_URL}/`)
  response.cookies.delete('user_id')
  return response
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Error signing out:', err)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('user_id')
  return response
}
