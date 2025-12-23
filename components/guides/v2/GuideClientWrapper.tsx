"use client"

import { useState, useEffect } from "react"
import { PropertyGuideV2 } from "./PropertyGuideV2"
import { GuideLogin } from "./GuideLogin"

interface GuideClientWrapperProps {
    propertyId: string
    propertyName?: string
}

export function GuideClientWrapper({ propertyId, propertyName }: GuideClientWrapperProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [booking, setBooking] = useState(null)

    // Log para depuración
    useEffect(() => {
        console.log("[GuideClientWrapper] Component mounted")
        console.log("[GuideClientWrapper] isAuthenticated:", isAuthenticated)
        console.log("[GuideClientWrapper] propertyId:", propertyId)
        console.log("[GuideClientWrapper] propertyName:", propertyName)
    }, [])

    useEffect(() => {
        console.log("[GuideClientWrapper] isAuthenticated changed to:", isAuthenticated)
    }, [isAuthenticated])

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

    // SIEMPRE mostrar el login si no está autenticado
    if (!isAuthenticated) {
        console.log("[GuideClientWrapper] Rendering GuideLogin - isAuthenticated is false")
        return (
            <GuideLogin
                propertyId={propertyId}
                propertyName={propertyName}
                onLoginSuccess={(b) => {
                    console.log("[GuideClientWrapper] Login success callback triggered, booking:", b)
                    if (b) {
                        setBooking(b)
                        setIsAuthenticated(true)
                        console.log("[GuideClientWrapper] Setting isAuthenticated to true")
                    } else {
                        console.error("[GuideClientWrapper] Login success but no booking provided")
                    }
                }}
            />
        )
    }

    // Si está autenticado, mostrar la guía
    console.log("[GuideClientWrapper] Rendering PropertyGuideV2 - isAuthenticated is true")
    return <PropertyGuideV2 propertyId={propertyId} />
}
