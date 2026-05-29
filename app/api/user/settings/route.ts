import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = authUser.id
    const {
      ai_provider,
      writing_tone,
      gemini_api_key,
      openai_api_key,
      anthropic_api_key,
    } = await req.json()

    const { data, error } = await supabase
      .from('users')
      .update({
        ai_provider: ai_provider || null,
        writing_tone: writing_tone || null,
        gemini_api_key: gemini_api_key || null,
        openai_api_key: openai_api_key || null,
        anthropic_api_key: anthropic_api_key || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user settings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: data })
  } catch (err) {
    console.error('Unexpected settings error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
