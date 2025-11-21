/**
 * Configuration for environment variables
 * Handles missing variables gracefully during build time
 */

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const

export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ] as const

  const missing = required.filter(key => !env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}

export function isDevelopment() {
  return process.env.NODE_ENV === 'development'
}

export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

export function isBuildTime() {
  // During build/prerendering, window is not available
  return typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build'
}

export function isClientRuntime() {
  return typeof window !== 'undefined'
}