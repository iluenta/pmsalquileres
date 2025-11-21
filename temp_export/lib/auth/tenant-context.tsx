"use client"

import type React from "react"

import { createContext, useContext } from "react"
import { useAuth } from "./auth-context"

interface TenantContextType {
  tenantId: string | null
  tenantName: string | null
  tenantSlug: string | null
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { userInfo } = useAuth()

  const value: TenantContextType = {
    tenantId: userInfo?.tenant_id ?? null,
    tenantName: userInfo?.tenant_name ?? null,
    tenantSlug: userInfo?.tenant_slug ?? null,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
