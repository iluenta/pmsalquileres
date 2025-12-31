"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCookie, setCookie, deleteGuideCookies } from "@/lib/utils/cookies"
import { getGuideThemePublic } from "@/lib/api/guides-public"
import { themeConfigs, hexToRgb } from "@/lib/utils/themes"

interface GuideLoginProps {
    propertyId: string
    onLoginSuccess: (booking: any) => void
    propertyName?: string
}

export function GuideLogin({ propertyId, onLoginSuccess, propertyName }: GuideLoginProps) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [loading, setLoading] = useState(false)
    const [theme, setTheme] = useState<string>("default")
    const [isThemeLoading, setIsThemeLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Leer cookies y cargar tema
    useEffect(() => {
        if (!propertyId) return

        // Cargar tema de la guía
        const loadTheme = async () => {
            try {
                const data = await getGuideThemePublic(propertyId)
                if (data?.theme) {
                    setTheme(data.theme)
                }
            } catch (err) {
                console.error("Error loading theme for login:", err)
            } finally {
                setIsThemeLoading(false)
            }
        }

        loadTheme()

        // Leer cookies específicas para esta propiedad
        const savedFirstName = getCookie(`guide_guest_${propertyId}_firstName`)
        const savedLastName = getCookie(`guide_guest_${propertyId}_lastName`)

        if (savedFirstName) setFirstName(savedFirstName)
        if (savedLastName) setLastName(savedLastName)
    }, [propertyId])

    // Configuración de colores
    const config = themeConfigs[theme] || themeConfigs.default

    // Aplicar variables de tema al root para estilos globales (como el scrollbar)
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--guide-primary', config.primary);
        root.style.setProperty('--guide-primary-rgb', hexToRgb(config.primary));
        root.style.setProperty('--guide-secondary', config.secondary);

        // Opcional: limpiar al desmontar
        return () => {
            root.style.removeProperty('--guide-primary');
            root.style.removeProperty('--guide-primary-rgb');
            root.style.removeProperty('--guide-secondary');
        };
    }, [theme])

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

    // Mientras carga el tema, mostrar loader neutro para evitar el flash azul
    if (isThemeLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (handleSubmit content remains the same)
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
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
                setCookie(`guide_guest_${propertyId}_firstName`, firstName, 15)
                setCookie(`guide_guest_${propertyId}_lastName`, lastName, 15)
                onLoginSuccess(result.booking)
            } else {
                deleteGuideCookies(propertyId)
                setError(result.message || "No se pudo validar el acceso")
            }
        } catch (err) {
            console.error('[GuideLogin] Error:', err)
            deleteGuideCookies(propertyId)
            setError("Error al conectar con el servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gray-50 p-4 transition-colors duration-500"
            style={{
                ['--guide-primary' as any]: config.primary,
                ['--guide-secondary' as any]: config.secondary,
                ['--guide-primary-rgb' as any]: hexToRgb(config.primary)
            }}
        >
            <Card className="w-full max-w-md shadow-xl border-t-4" style={{ borderTopColor: 'var(--guide-primary)' }}>
                <CardHeader className="text-center pb-2">
                    <div
                        className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: 'var(--guide-secondary)' }}
                    >
                        <Lock className="h-6 w-6" style={{ color: 'var(--guide-primary)' }} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Guía del Huésped</CardTitle>
                    {propertyName && (
                        <CardDescription className="font-medium" style={{ color: 'var(--guide-primary)' }}>
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
                                className="h-12 focus-visible:ring-[var(--guide-primary)]"
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
                                className="h-12 focus-visible:ring-[var(--guide-primary)]"
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
                            className="w-full h-12 text-white font-bold text-lg shadow-md transition-all active:scale-[0.98]"
                            disabled={loading}
                            style={{
                                backgroundColor: 'var(--guide-primary)',
                                '--hover-bg': `rgba(var(--guide-primary-rgb), 0.9)`
                            } as any}
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
