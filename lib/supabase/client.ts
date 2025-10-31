import { createBrowserClient } from "@supabase/ssr"
import { env, isDevelopment, isClientRuntime } from "@/lib/config/env"

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  // Validate environment variables
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const errorMessage = 'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.'
    
    // During build time (prerendering), return null to allow build to continue
    // The error will be caught in client runtime where it can be handled properly
    if (!isClientRuntime()) {
      console.warn(`[Supabase] ${errorMessage} - Build time, returning null`)
      return null as any
    }
    
    if (isDevelopment()) {
      console.warn(`[Supabase] ${errorMessage}`)
      // In development, return null to allow the app to continue
      return null as any
    }
    
    // In production client runtime, throw an error to make the problem visible
    console.error(`[Supabase] ${errorMessage}`)
    throw new Error(errorMessage)
  }

  try {
    client = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return client
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error)
    // Only throw in client runtime, not during build
    if (isClientRuntime()) {
      throw error
    }
    return null as any
  }
}
