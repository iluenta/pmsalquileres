"use client"

import { useState, useEffect } from "react"
import { PropertyGuideV2 } from "./PropertyGuideV2"
import { GuideLogin } from "./GuideLogin"
import { Language } from "./LanguageSelector"

interface GuideClientWrapperProps {
    propertyId: string
    propertyName?: string
}

export function GuideClientWrapper({ propertyId, propertyName }: GuideClientWrapperProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [booking, setBooking] = useState<any>(null)
    const [currentLanguage, setCurrentLanguage] = useState<Language>("es")

    // Detección inicial de idioma
    useEffect(() => {
        const browserLang = navigator.language.split("-")[0] as any
        const supportedLanguages: Language[] = ["es", "en", "fr", "de", "it"]

        if (supportedLanguages.includes(browserLang)) {
            setCurrentLanguage(browserLang)
        }
    }, [])

    // Log para depuración
    useEffect(() => {
        console.log("=".repeat(50))
        console.log("[GuideClientWrapper] Component mounted/updated")
        console.log("[GuideClientWrapper] isAuthenticated:", isAuthenticated)
        console.log("[GuideClientWrapper] currentLanguage:", currentLanguage)
        console.log("[GuideClientWrapper] propertyId:", propertyId)
        console.log("[GuideClientWrapper] Will render:", isAuthenticated ? "PropertyGuideV2" : "GuideLogin")
        console.log("=".repeat(50))
    }, [isAuthenticated, propertyId, propertyName, currentLanguage])

    if (!propertyId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600">Error: No se proporcionó un ID de propiedad válido</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <GuideLogin
                propertyId={propertyId}
                propertyName={propertyName}
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                onLoginSuccess={(b) => {
                    if (b) {
                        setBooking(b)
                        setIsAuthenticated(true)
                    }
                }}
            />
        )
    }

    return (
        <PropertyGuideV2
            propertyId={propertyId}
            booking={booking}
            initialLanguage={currentLanguage}
        />
    )
}
