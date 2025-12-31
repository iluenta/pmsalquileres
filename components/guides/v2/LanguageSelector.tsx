"use client"

import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Globe, Check } from "lucide-react"

export type Language = "es" | "en" | "fr" | "de" | "it"

interface LanguageSelectorProps {
    currentLanguage: Language
    onLanguageChange: (lang: Language) => void
    isTranslating?: boolean
}

const languages: { code: Language; label: string; flag: string }[] = [
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
]

export function LanguageSelector({
    currentLanguage,
    onLanguageChange,
    isTranslating = false,
}: LanguageSelectorProps) {
    const currentLangObj = languages.find((l) => l.code === currentLanguage)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 h-9 px-3 border-gray-200 hover:border-[var(--guide-primary)] transition-colors bg-white/50 backdrop-blur-sm"
                    disabled={isTranslating}
                >
                    <Globe className={`h-4 w-4 ${isTranslating ? 'animate-spin' : ''}`} style={{ color: 'var(--guide-primary)' }} />
                    <span className="text-xs font-semibold uppercase">{currentLanguage}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 p-1">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => onLanguageChange(lang.code)}
                        className="flex items-center justify-between cursor-pointer py-2"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm font-medium">{lang.label}</span>
                        </div>
                        {currentLanguage === lang.code && (
                            <Check className="h-4 w-4" style={{ color: 'var(--guide-primary)' }} />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
