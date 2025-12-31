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
import { uiTranslations } from "@/lib/utils/ui-translations"
import { LanguageSelector, Language } from "./LanguageSelector"

interface GuideLoginProps {
    propertyId: string
    onLoginSuccess: (booking: any) => void
    propertyName?: string
    currentLanguage?: Language
    onLanguageChange?: (lang: Language) => void
}

export function GuideLogin({
    propertyId,
    onLoginSuccess,
    propertyName,
    currentLanguage = "es",
    onLanguageChange
}: GuideLoginProps) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [loading, setLoading] = useState(false)
    const [theme, setTheme] = useState<string>("default")
    const [isThemeLoading, setIsThemeLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const t = uiTranslations[currentLanguage] || uiTranslations["es"]

    // Leer cookies y cargar tema
    useEffect(() => {
        if (!propertyId) return

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

        const savedFirstName = getCookie(`guide_guest_${propertyId}_firstName`)
        const savedLastName = getCookie(`guide_guest_${propertyId}_lastName`)

        if (savedFirstName) setFirstName(savedFirstName)
        if (savedLastName) setLastName(savedLastName)
    }, [propertyId])

    const config = themeConfigs[theme] || themeConfigs.default

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--guide-primary', config.primary);
        root.style.setProperty('--guide-primary-rgb', hexToRgb(config.primary));
        root.style.setProperty('--guide-secondary', config.secondary);

        return () => {
            root.style.removeProperty('--guide-primary');
            root.style.removeProperty('--guide-primary-rgb');
            root.style.removeProperty('--guide-secondary');
        };
    }, [theme, config])

    if (!propertyId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <p className="text-red-600">{t.error_no_property}</p>
                </div>
            </div>
        )
    }

    if (isThemeLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
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
                setError(result.message || t.error_validate_access)
            }
        } catch (err) {
            console.error('[GuideLogin] Error:', err)
            deleteGuideCookies(propertyId)
            setError(t.error_server)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 transition-colors duration-500"
            style={{
                ['--guide-primary' as any]: config.primary,
                ['--guide-secondary' as any]: config.secondary,
                ['--guide-primary-rgb' as any]: hexToRgb(config.primary)
            }}
        >
            {/* Language Selector Above Card */}
            <div className="w-full max-w-md flex justify-end mb-4">
                {onLanguageChange && (
                    <LanguageSelector
                        currentLanguage={currentLanguage}
                        onLanguageChange={onLanguageChange}
                    />
                )}
            </div>

            <Card className="w-full max-w-md shadow-xl border-t-4" style={{ borderTopColor: 'var(--guide-primary)' }}>
                <CardHeader className="text-center pb-2">
                    <div
                        className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: 'var(--guide-secondary)' }}
                    >
                        <Lock className="h-6 w-6" style={{ color: 'var(--guide-primary)' }} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{t.login_title}</CardTitle>
                    {propertyName && (
                        <CardDescription className="font-medium" style={{ color: 'var(--guide-primary)' }}>
                            {propertyName}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 text-sm text-center mb-8">
                        {t.login_desc}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">{t.first_name}</Label>
                            <Input
                                id="firstName"
                                placeholder={t.first_name_placeholder}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="h-12 focus-visible:ring-[var(--guide-primary)]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">{t.last_name}</Label>
                            <Input
                                id="lastName"
                                placeholder={t.last_name_placeholder}
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
                                    {t.validating}
                                </>
                            ) : (
                                t.login_button
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 italic">
                            {t.login_footer}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
