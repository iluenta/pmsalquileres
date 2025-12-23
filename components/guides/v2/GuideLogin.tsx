"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GuideLoginProps {
    propertyId: string
    onLoginSuccess: (booking: any) => void
    propertyName?: string
}

export function GuideLogin({ propertyId, onLoginSuccess, propertyName }: GuideLoginProps) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Validar que propertyId existe
    useEffect(() => {
        if (!propertyId) {
            console.error("[GuideLogin] No propertyId provided")
        } else {
            console.log("[GuideLogin] Component mounted with propertyId:", propertyId)
        }
    }, [propertyId])

    // Si no hay propertyId, mostrar error
    if (!propertyId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <p className="text-red-600">Error: No se proporcionó un ID de propiedad válido</p>
                </div>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            // Usar API route en lugar de Server Action para mejor compatibilidad
            const response = await fetch('/api/public/guides/validate-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    propertyId,
                    firstName,
                    lastName,
                }),
            })

            const result = await response.json()

            if (result.success) {
                onLoginSuccess(result.booking)
            } else {
                setError(result.message || "No se pudo validar el acceso")
            }
        } catch (err) {
            console.error('[GuideLogin] Error:', err)
            setError("Error al conectar con el servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Guía del Huésped</CardTitle>
                    {propertyName && (
                        <CardDescription className="text-blue-600 font-medium">
                            {propertyName}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 text-sm text-center mb-8">
                        Por motivos de privacidad, introduce tus datos para acceder a la guía de tu estancia.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombre</Label>
                            <Input
                                id="firstName"
                                placeholder="Tu nombre"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Primer Apellido</Label>
                            <Input
                                id="lastName"
                                placeholder="Tu primer apellido"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className="h-12"
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-md transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Validando...
                                </>
                            ) : (
                                "Acceder a la Guía"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 italic">
                            El acceso se activa 10 días antes de tu llegada y finaliza el día siguiente a tu salida.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
