import { createBrowserClient } from "@supabase/ssr"
import { env, isDevelopment } from "@/lib/config/env"

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  // Validate environment variables
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const errorMessage = 'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.'
    
    // Always return null during build/prerendering (when window is undefined)
    // This prevents build errors - the error will show in client runtime instead
    if (typeof window === 'undefined') {
      // This is build time or server-side rendering
      console.warn(`[Supabase] ${errorMessage} - Build/SSR time, returning null`)
      return null as any
    }
    
    if (isDevelopment()) {
      console.warn(`[Supabase] ${errorMessage}`)
      // In development, return null to allow the app to continue
      return null as any
    }
    
    // In production client runtime (window is defined), throw error to make problem visible
    console.error(`[Supabase] ${errorMessage}`)
    throw new Error(errorMessage)
  }

  // Only create client if we have the required environment variables
  // And only if we're in a client environment (window is defined)
  if (typeof window === 'undefined') {
    // During build/SSR, return null even if env vars are present
    // The client should only be created in browser runtime
    return null as any
  }

  try {
    client = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return client
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error)
    // Only throw in client runtime, not during build/SSR
    if (typeof window !== 'undefined') {
      throw error
    }
    return null as any
  }
}
