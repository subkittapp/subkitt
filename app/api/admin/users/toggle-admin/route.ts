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

    const { userId, isAdmin } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
    }

    // Check we aren't demoting ourselves
    if (userId === authUser.id) {
      return NextResponse.json({ error: 'You cannot change your own admin privileges.' }, { status: 400 })
    }

    const { data: updatedUser, error: updateErr } = await supabaseService
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId)
      .select('*')
      .single()

    if (updateErr) {
      throw updateErr
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (err: any) {
    console.error('Error toggling admin status:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
