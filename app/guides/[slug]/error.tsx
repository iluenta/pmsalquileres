"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("[GuideError] Error:", error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center max-w-md">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Error al cargar la guía
                </h1>
                <p className="text-gray-600 mb-6">
                    {error.message || "Ocurrió un error inesperado al cargar la guía del huésped."}
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={reset} variant="default">
                        Intentar de nuevo
                    </Button>
                    <Button onClick={() => window.location.href = "/"} variant="outline">
                        Volver al inicio
                    </Button>
                </div>
            </div>
        </div>
    )
}

