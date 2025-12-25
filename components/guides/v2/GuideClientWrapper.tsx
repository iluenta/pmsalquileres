"use client"

import { useState, useEffect } from "react"
import { PropertyGuideV2 } from "./PropertyGuideV2"
import { GuideLogin } from "./GuideLogin"

interface GuideClientWrapperProps {
    propertyId: string
    propertyName?: string
}

export function GuideClientWrapper({ propertyId, propertyName }: GuideClientWrapperProps) {
    // FORZAR isAuthenticated a false inicialmente - no usar localStorage ni nada que pueda persistir
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [booking, setBooking] = useState<any>(null)

    // Log para depuración - siempre ejecutar
    useEffect(() => {
        console.log("=".repeat(50))
        console.log("[GuideClientWrapper] Component mounted")
        console.log("[GuideClientWrapper] isAuthenticated:", isAuthenticated)
        console.log("[GuideClientWrapper] propertyId:", propertyId)
        console.log("[GuideClientWrapper] propertyName:", propertyName)
        console.log("[GuideClientWrapper] Will render:", isAuthenticated ? "PropertyGuideV2" : "GuideLogin")
        console.log("=".repeat(50))
    }, [isAuthenticated, propertyId, propertyName])

    // Validar que propertyId existe
    if (!propertyId) {
        console.error("[GuideClientWrapper] No propertyId provided")
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600">Error: No se proporcionó un ID de propiedad válido</p>
                </div>
            </div>
        )
    }

    // SIEMPRE mostrar el login si no está autenticado - esta es la condición principal
    if (!isAuthenticated) {
        console.log("[GuideClientWrapper] ✅ Rendering GuideLogin - isAuthenticated is FALSE")
        return (
            <GuideLogin
                propertyId={propertyId}
                propertyName={propertyName}
                onLoginSuccess={(b) => {
                    console.log("[GuideClientWrapper] 🔐 Login success callback triggered")
                    console.log("[GuideClientWrapper] Booking received:", b)
                    if (b) {
                        setBooking(b)
                        setIsAuthenticated(true)
                        console.log("[GuideClientWrapper] ✅ Setting isAuthenticated to TRUE")
                    } else {
                        console.error("[GuideClientWrapper] ❌ Login success but no booking provided")
                    }
                }}
            />
        )
    }

    // Si está autenticado, mostrar la guía
    console.log("[GuideClientWrapper] 📖 Rendering PropertyGuideV2 - isAuthenticated is TRUE")
    return <PropertyGuideV2 propertyId={propertyId} booking={booking} />
}
