import type { GuideContactInfo, InterestPhoneCategory, GuideSection } from "@/types/guides"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MessageCircle, AlertTriangle, Wrench, CheckCircle2, MapPin, MessageSquare, Stethoscope, Pill } from "lucide-react"
import { getIconByName } from "@/lib/utils/icon-registry"
import { uiTranslations } from "@/lib/utils/ui-translations"

interface ContactSectionProps {
    contactInfo: GuideContactInfo
    introSection?: GuideSection
    currentLanguage?: string
}

export function ContactSection({ contactInfo, introSection, currentLanguage = "es" }: ContactSectionProps) {
    const t = uiTranslations[currentLanguage] || uiTranslations["es"]

    // Parse emergency_numbers
    const emergencyNumbers = contactInfo.emergency_numbers && typeof contactInfo.emergency_numbers === 'object'
        ? contactInfo.emergency_numbers
        : null

    const emergencias = emergencyNumbers?.emergencias || "112"
    const policiaLocal = emergencyNumbers?.policia_local || contactInfo.police_contact || "092"
    const guardiaCivil = emergencyNumbers?.guardia_civil || contactInfo.police_contact || "062"
    const bomberos = emergencyNumbers?.bomberos || contactInfo.fire_contact || "080"

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-10">
                {(() => {
                    const Icon = getIconByName(introSection?.icon, Phone)
                    return (
                        <div
                            className="inline-flex items-center justify-center p-3 rounded-full mb-4"
                            style={{ backgroundColor: 'var(--guide-secondary)' }}
                        >
                            <Icon className="h-8 w-8" style={{ color: 'var(--guide-primary)' }} />
                        </div>
                    )
                })()}
                <h2 className="text-3xl font-bold text-gray-900">{introSection?.title || t.contact_default_title}</h2>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                    {introSection?.content || t.contact_default_desc}
                </p>
            </div>
            {/* Grid de 2 columnas: Anfitriones + Servicios (izq) y Teléfonos (der) */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-6">
                    {/* Tarjeta 1: Tus Anfitriones */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" style={{ color: 'var(--guide-primary)' }} />
                                {t.hosts_title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {contactInfo.host_names && (
                                <div className="text-lg font-semibold text-gray-900 mb-4">
                                    {contactInfo.host_names}
                                </div>
                            )}

                            {contactInfo.phone && (
                                <a
                                    href={`tel:${contactInfo.phone}`}
                                    className="flex items-center gap-3 text-gray-700 transition-colors"
                                    style={{ '--hover-color': 'var(--guide-primary)' } as any}
                                >
                                    <Phone className="h-5 w-5 text-gray-500" />
                                    <span className="font-medium">{t.call}</span>
                                    <span className="hover:text-[var(--hover-color)]">{contactInfo.phone}</span>
                                </a>
                            )}

                            {contactInfo.email && (
                                <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors">
                                    <Mail className="h-5 w-5 text-gray-500" />
                                    <span className="font-medium">Email</span>
                                    <span>{contactInfo.email}</span>
                                </a>
                            )}

                            {contactInfo.whatsapp && (
                                <a
                                    href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    <MessageCircle className="h-5 w-5 text-gray-500" />
                                    <span className="font-medium">WhatsApp</span>
                                    <span>{contactInfo.whatsapp}</span>
                                </a>
                            )}

                            {contactInfo.support_person_name && contactInfo.support_person_phone && (
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-2">{t.support_person}</h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {contactInfo.support_person_name} {t.support_person_desc}
                                    </p>
                                    <div className="space-y-2">
                                        <a
                                            href={`tel:${contactInfo.support_person_phone}`}
                                            className="flex items-center gap-2 transition-colors"
                                            style={{ color: 'var(--guide-primary)' }}
                                        >
                                            <Phone className="h-4 w-4" />
                                            <span className="text-sm">{contactInfo.support_person_phone}</span>
                                        </a>
                                        {contactInfo.support_person_whatsapp && (
                                            <a
                                                href={`https://wa.me/${contactInfo.support_person_whatsapp.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 transition-colors"
                                                style={{ color: 'var(--guide-primary)' }}
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                                <span className="text-sm">{contactInfo.support_person_whatsapp}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {contactInfo.host_message && (
                                <p className="text-xs text-gray-500 text-center mt-6 pt-4 border-t">
                                    {contactInfo.host_message}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tarjeta 3: Servicios del Apartamento */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="h-5 w-5" style={{ color: 'var(--guide-primary)' }} />
                                {t.apartment_services}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-700 text-sm">
                                {t.service_problems_title}
                            </p>

                            {contactInfo.service_issues && contactInfo.service_issues.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {contactInfo.service_issues.map((issue, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{issue}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">
                                    {t.no_service_problems}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Columna Derecha: Teléfonos de Interés */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            {t.interest_phones}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Grid de números básicos de emergencia */}
                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href={`tel:${emergencias}`}
                                className="bg-red-50 border-2 border-red-500 p-3 rounded-lg text-center hover:bg-red-100 transition-colors"
                            >
                                <div className="font-bold text-sm mb-1 text-red-500">{t.emergency_label}</div>
                                <div className="text-lg font-semibold text-red-700">{emergencias}</div>
                            </a>
                            <a
                                href={`tel:${policiaLocal}`}
                                className="bg-white border-2 border-gray-200 p-3 rounded-lg text-center hover:border-gray-300 transition-colors"
                            >
                                <div className="font-bold text-sm mb-1 text-gray-800">{t.local_police}</div>
                                <div className="text-lg font-semibold text-gray-900">{policiaLocal}</div>
                            </a>
                            <a
                                href={`tel:${guardiaCivil}`}
                                className="bg-white border-2 border-gray-200 p-3 rounded-lg text-center hover:border-gray-300 transition-colors"
                            >
                                <div className="font-bold text-sm mb-1 text-gray-800">{t.civil_guard}</div>
                                <div className="text-lg font-semibold text-gray-900">{guardiaCivil}</div>
                            </a>
                            <a
                                href={`tel:${bomberos}`}
                                className="bg-white border-2 border-gray-200 p-3 rounded-lg text-center hover:border-gray-300 transition-colors"
                            >
                                <div className="font-bold text-sm mb-1 text-gray-800">{t.firefighters}</div>
                                <div className="text-lg font-semibold text-gray-900">{bomberos}</div>
                            </a>
                        </div>

                        {/* Categorías adicionales de interest_phones */}
                        {contactInfo.interest_phones && contactInfo.interest_phones.length > 0 && (
                            <div className="space-y-4 pt-4 border-t">
                                {contactInfo.interest_phones.map((category: InterestPhoneCategory, catIndex: number) => {
                                    const categoryLabels: Record<string, string> = {
                                        farmacia: t.cat_pharmacy,
                                        veterinario: t.cat_vet,
                                        medico: t.cat_doctor,
                                        otros: t.cat_others
                                    }

                                    const categoryLabel = categoryLabels[category.category] || category.category
                                    const isMedico = category.category === 'medico'
                                    const isFarmacia = category.category === 'farmacia'
                                    const isVeterinario = category.category === 'veterinario'
                                    const isOtros = category.category === 'otros'

                                    if (category.contacts.length === 0) return null

                                    // Colores para cada categoría
                                    const getIconColor = () => {
                                        if (isFarmacia) return "text-green-600"
                                        if (isMedico) return "text-[var(--guide-primary)]"
                                        if (isVeterinario) return "text-orange-600"
                                        if (isOtros) return "text-purple-600"
                                        return "text-gray-600"
                                    }

                                    return (
                                        <div key={catIndex} className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                {isMedico ? (
                                                    <Stethoscope className={`h-4 w-4 ${getIconColor()}`} />
                                                ) : isFarmacia ? (
                                                    <Pill className={`h-4 w-4 ${getIconColor()}`} />
                                                ) : (
                                                    <Phone className={`h-4 w-4 ${getIconColor()}`} />
                                                )}
                                                <h5 className="text-sm font-semibold text-gray-800">{categoryLabel}</h5>
                                            </div>
                                            <div className="pl-6 space-y-3">
                                                {category.contacts.map((contact, contactIndex) => (
                                                    <div key={contactIndex} className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-gray-400" />
                                                            <a
                                                                href={`tel:${contact.phone}`}
                                                                className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                                            >
                                                                {contact.name}
                                                            </a>
                                                        </div>
                                                        <a
                                                            href={`tel:${contact.phone}`}
                                                            className="text-sm text-gray-700 hover:text-blue-600 transition-colors block pl-6"
                                                        >
                                                            {contact.phone}
                                                        </a>
                                                        {contact.address && (
                                                            <div className="flex items-start gap-2 pl-6 text-xs text-gray-600">
                                                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                                <span>{contact.address}</span>
                                                            </div>
                                                        )}
                                                        {contact.description && (
                                                            <p className="pl-6 text-xs text-gray-500 italic">{contact.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
