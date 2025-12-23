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
        console.log("[GuideClientWrapper] isAuthenticated:", isAuthenticated)
        console.log("[GuideClientWrapper] propertyId:", propertyId)
    }, [isAuthenticated, propertyId])

    if (!isAuthenticated) {
        return (
            <GuideLogin
                propertyId={propertyId}
                propertyName={propertyName}
                onLoginSuccess={(b) => {
                    console.log("[GuideClientWrapper] Login success, booking:", b)
                    setBooking(b)
                    setIsAuthenticated(true)
                }}
            />
        )
    }

    return <PropertyGuideV2 propertyId={propertyId} />
}
