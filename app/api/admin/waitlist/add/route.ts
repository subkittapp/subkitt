import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  try {
    const cookieSupabase = await createClient()
    const { data: { user: authUser }, error: authErr } = await cookieSupabase.auth.getUser()

    if (authErr || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseService = createServerClient()

    // Double-check admin privileges in DB
    const { data: profile } = await supabaseService
      .from('users')
      .select('is_admin, email')
      .eq('id', authUser.id)
      .single()

    const isAuthorized = authUser.email === 'febcheema@gmail.com' || profile?.is_admin === true

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, referrer } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid or missing email address.' }, { status: 400 })
    }

    // Insert into waitlist
    const { data: newEntry, error: insertErr } = await supabaseService
      .from('waitlist')
      .insert({
        email,
        referrer: referrer || 'admin-manual',
        user_agent: 'SubKitt Admin Console Manual Add',
      })
      .select('*')
      .single()

    if (insertErr) {
      throw insertErr
    }

    return NextResponse.json({ success: true, entry: newEntry })
  } catch (err: any) {
    console.error('Error adding waitlist entry manually:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
