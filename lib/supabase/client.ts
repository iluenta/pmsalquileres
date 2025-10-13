import { createBrowserClient } from "@supabase/ssr"
import { env, isDevelopment } from "@/lib/config/env"

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  // In development or if env vars are missing, provide fallback
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isDevelopment()) {
      console.warn('Supabase environment variables not found, using fallback')
    }
    // Return a mock client for build time
    return null as any
  }

  client = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return client
}
