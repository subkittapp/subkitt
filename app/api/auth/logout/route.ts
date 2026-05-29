import { NextRequest, NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(`${APP_URL}/`)
  response.cookies.delete('user_id')
  return response
}

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('user_id')
  return response
}
