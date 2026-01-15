import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env, isDevelopment } from "@/lib/config/env"

export async function getSupabaseServerClient() {
  const cookieStore = await cookies()

  // In development or if env vars are missing, provide fallback
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isDevelopment()) {
      console.warn('Supabase environment variables not found, using fallback')
    }
    // Return a mock client for build time
    return null as any
  }

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: any[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
