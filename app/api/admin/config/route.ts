import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@/lib/supabase-server'

// Read system configs
export async function GET() {
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

    // Retrieve configs
    const { data: configs } = await supabaseService
      .from('system_config')
      .select('*')

    return NextResponse.json({ success: true, configs: configs || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

// Update system configs
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

    const { key, value } = await req.json()
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Missing key or value parameter' }, { status: 400 })
    }

    const { data: config, error: upsertErr } = await supabaseService
      .from('system_config')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select('*')
      .single()

    if (upsertErr) {
      throw upsertErr
    }

    return NextResponse.json({ success: true, config })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
