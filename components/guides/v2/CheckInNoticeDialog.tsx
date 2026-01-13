"use client"

import React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Info, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckInNoticeDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    instructions: string | null
    onConfirm: () => void
    currentLanguage: string
}

const translations = {
    es: {
        title: "Aviso de Registro",
        description: "Información importante para completar su check-in correctamente.",
        button: "Entendido, continuar",
        noInstructions: "A continuación accederá al proceso de registro online. Por favor, tenga a mano su documentación."
    },
    en: {
        title: "Check-in Notice",
        description: "Important information to complete your check-in correctly.",
        button: "Got it, continue",
        noInstructions: "You will now proceed to the online registration process. Please have your documentation ready."
    },
    pt: {
        title: "Aviso de Registro",
        description: "Informações importantes para completar o seu check-in corretamente.",
        button: "Entendido, continuar",
        noInstructions: "Agora você prosseguirá para o processo de registro online. Por favor, tenha sua documentação pronta."
    },
    fr: {
        title: "Avis d'enregistrement",
        description: "Informations importantes para complèter votre check-in correctement.",
        button: "Compris, continuer",
        noInstructions: "Vous allez maintenant passer au processus d'enregistrement en ligne. Veuillez préparer vos documents."
    },
    de: {
        title: "Check-in Hinweiss",
        description: "Wichtige Informationen, um Ihren Check-in korrekt abzuschließen.",
        button: "Verstanden, weiter",
        noInstructions: "Sie fahren nun mit dem Online-Registrierungsprozess fort. Bitte halten Sie Ihre Unterlagen bereit."
    }
}

export function CheckInNoticeDialog({
    isOpen,
    onOpenChange,
    instructions,
    onConfirm,
    currentLanguage
}: CheckInNoticeDialogProps) {
    const t = translations[currentLanguage as keyof typeof translations] || translations.es

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[440px] border-none shadow-xl overflow-hidden p-0 bg-white rounded-2xl sm:rounded-3xl">
                {/* Header suave sin gradientes agresivos */}
                <div className="pt-8 px-8 pb-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(var(--guide-primary-rgb), 0.1)' }}>
                        <Sparkles className="h-6 w-6" style={{ color: 'var(--guide-primary)' }} />
                    </div>

                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {t.title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-sm leading-relaxed px-2">
                            {t.description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-10 pb-2">
                    {/* Texto fluido sin cajas que lo encajonen */}
                    <div className="flex gap-4">
                        <div className="mt-1 flex-shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: 'var(--guide-primary)' }} />
                        </div>
                        <p className="text-gray-600 text-[16px] whitespace-pre-wrap leading-[1.6] font-medium">
                            {instructions || t.noInstructions}
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-8 flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={onConfirm}
                        className="w-full text-white font-semibold h-12 rounded-xl border-none shadow-md transition-all active:scale-[0.98] group"
                        style={{ backgroundColor: 'var(--guide-primary)' }}
                    >
                        <span className="flex items-center justify-center gap-2">
                            {t.button}
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
