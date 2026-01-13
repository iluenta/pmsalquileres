"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface UserInfo {
  user_id: string
  email: string
  full_name: string
  tenant_id: string
  tenant_name: string
  tenant_slug: string
  is_admin: boolean
  theme_color: string | null
  language: string
  timezone: string
  date_format: string
  roles: string[]
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  userInfo: UserInfo | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUserInfo: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef<string | null>(null)

  // Get Supabase client - will throw error in production if env vars missing
  // Error will be caught by error.tsx ErrorBoundary
  const supabase = getSupabaseBrowserClient()

  const fetchUserInfo = async (userId: string) => {
    if (!supabase) {
      console.error("[v0] Supabase client not available")
      return
    }

    if (fetchingRef.current === userId) return
    fetchingRef.current = userId

    try {
      console.log(`[v0] Fetching user info for ${userId}...`)
      const { data, error } = await supabase.rpc("get_user_info", {
        p_user_id: userId,
      })

      if (error) {
        console.error("[v0] Error fetching user info details:", error)
        // Log literal error to see full object
        return
      }

      if (data && data.length > 0) {
        setUserInfo(data[0])
      }
    } catch (error) {
      console.error("[v0] Error in fetchUserInfo:", error)
    } finally {
      fetchingRef.current = null
    }
  }

  const refreshUserInfo = async () => {
    if (user) {
      await fetchUserInfo(user.id)
    }
  }

  useEffect(() => {
    if (!supabase) {
      console.error("[v0] Supabase client not initialized. Please check environment variables.")
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserInfo(session.user.id)
      }
      setLoading(false)
    }).catch((error: unknown) => {
      console.error("[v0] Error getting session:", error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserInfo(session.user.id)
      } else {
        setUserInfo(null)
      }
      setLoading(false)
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [supabase])

  const signOut = async () => {
    if (!supabase) {
      setUser(null)
      setUserInfo(null)
      return
    }

    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserInfo(null)
    } catch (error) {
      console.error("[v0] Error signing out:", error)
      setUser(null)
      setUserInfo(null)
    }
  }

  const hasPermission = (permission: string) => {
    if (userInfo?.is_admin) return true
    return userInfo?.permissions?.includes(permission) || false
  }

  return (
    <AuthContext.Provider value={{ user, userInfo, loading, signOut, refreshUserInfo, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
