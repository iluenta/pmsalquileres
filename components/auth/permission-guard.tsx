"use client"

import type React from "react"
import { useAuth } from "@/lib/auth/auth-context"

interface PermissionGuardProps {
    permission: string
    children: React.ReactNode
    fallback?: React.ReactNode
}

/**
 * Componente para mostrar u ocultar contenido basándose en los permisos del usuario.
 * Si el usuario es admin, siempre tiene acceso.
 */
export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
    const { hasPermission, loading } = useAuth()

    if (loading) return null

    if (hasPermission(permission)) {
        return <>{children}</>
    }

    return <>{fallback}</>
}
