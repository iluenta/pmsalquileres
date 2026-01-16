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
                if (result.token) {
                    setCookie(`guide_guest_${propertyId}_session`, result.token, 15)
                }
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
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-700"
            style={{
                backgroundColor: 'var(--guide-secondary)',
                ['--guide-primary' as any]: config.primary,
                ['--guide-secondary' as any]: config.secondary,
                ['--guide-primary-rgb' as any]: hexToRgb(config.primary)
            }}
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: 'var(--guide-primary)' }} />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: 'var(--guide-primary)' }} />

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
                {/* Language Selector */}
                <div className="flex justify-end mb-6">
                    {onLanguageChange && (
                        <LanguageSelector
                            currentLanguage={currentLanguage}
                            onLanguageChange={onLanguageChange}
                        />
                    )}
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden">
                    <div className="p-8 sm:p-10 pt-12">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div
                                className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl rotate-3"
                                style={{ backgroundColor: 'var(--guide-primary)' }}
                            >
                                <Lock className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                                {t.login_title}
                            </h1>
                            {propertyName && (
                                <p className="text-xl font-bold tracking-tight" style={{ color: 'var(--guide-primary)' }}>
                                    {propertyName}
                                </p>
                            )}
                        </div>

                        <p className="text-slate-500 text-center mb-10 leading-relaxed font-medium px-4">
                            {t.login_desc}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="firstName" className="text-sm font-bold text-slate-700 ml-1">{t.first_name}</Label>
                                <Input
                                    id="firstName"
                                    placeholder={t.first_name_placeholder}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus-visible:ring-[var(--guide-primary)] focus-visible:ring-offset-2 transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="lastName" className="text-sm font-bold text-slate-700 ml-1">{t.last_name}</Label>
                                <Input
                                    id="lastName"
                                    placeholder={t.last_name_placeholder}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="h-14 bg-slate-50/50 border-slate-200 rounded-2xl focus-visible:ring-[var(--guide-primary)] focus-visible:ring-offset-2 transition-all"
                                />
                            </div>

                            {error && (
                                <Alert className="bg-red-50 border-red-100 text-red-700 rounded-2xl animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5" />
                                    <AlertDescription className="font-medium">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-15 text-white font-black text-lg rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] py-8"
                                disabled={loading}
                                style={{
                                    backgroundColor: 'var(--guide-primary)',
                                    boxShadow: `0 20px 40px -12px rgba(var(--guide-primary-rgb), 0.3)`
                                } as any}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        {t.validating}
                                    </>
                                ) : (
                                    t.login_button
                                )}
                            </Button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                {t.login_footer}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
