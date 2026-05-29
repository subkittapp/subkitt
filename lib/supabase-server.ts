import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return new Proxy({} as any, {
      get(_, prop) {
        throw new Error(
          `Supabase server client properties accessed, but NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing.`
        )
      }
    })
  }

  return createClient(url, key)
}
