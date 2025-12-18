import type { GuideContactInfo } from "@/types/guides"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MessageCircle, AlertTriangle, ShieldCheck, Stethoscope, Flame } from "lucide-react"

interface ContactSectionProps {
    contactInfo: GuideContactInfo
}

export function ContactSection({ contactInfo }: ContactSectionProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                    <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Contacto</h2>
                <p className="text-gray-600 mt-2">Estamos aquí para ayudarte</p>
            </div>

            {/* Información del Anfitrión */}
            <Card>
                <CardHeader>
                    <CardTitle>Tus Anfitriones</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {contactInfo.host_names && (
                        <div className="text-lg font-medium">{contactInfo.host_names}</div>
                    )}

                    <div className="space-y-4 col-span-2">
                        {contactInfo.phone && (
                            <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="bg-green-100 p-2 rounded-full"><Phone className="h-5 w-5 text-green-600" /></div>
                                <div>
                                    <div className="text-sm text-gray-500">Teléfono</div>
                                    <div className="font-semibold text-gray-900">{contactInfo.phone}</div>
                                </div>
                            </a>
                        )}

                        {contactInfo.whatsapp && (
                            <a
                                href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="bg-green-100 p-2 rounded-full"><MessageCircle className="h-5 w-5 text-green-600" /></div>
                                <div>
                                    <div className="text-sm text-gray-500">WhatsApp</div>
                                    <div className="font-semibold text-gray-900">{contactInfo.whatsapp}</div>
                                </div>
                            </a>
                        )}

                        {contactInfo.email && (
                            <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="bg-blue-100 p-2 rounded-full"><Mail className="h-5 w-5 text-blue-600" /></div>
                                <div>
                                    <div className="text-sm text-gray-500">Email</div>
                                    <div className="font-semibold text-gray-900">{contactInfo.email}</div>
                                </div>
                            </a>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Números de Emergencia */}
            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Números de Emergencia
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
                {/* Emergencias General */}
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="h-8 w-8 text-red-100 text-red-500" />
                            <div>
                                <div className="font-bold">Emergencias</div>
                                <div className="text-xs text-gray-500">112 / General</div>
                            </div>
                        </div>
                        <a href="tel:112" className="text-lg font-black text-red-600 hover:underline">112</a>
                    </CardContent>
                </Card>

                {contactInfo.police_contact && (
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-6 w-6 text-blue-500" />
                                <div>
                                    <div className="font-bold">Policía</div>
                                    <div className="text-xs text-gray-500">Local / Nacional</div>
                                </div>
                            </div>
                            <a href={`tel:${contactInfo.police_contact}`} className="text-lg font-bold text-blue-600 hover:underline">{contactInfo.police_contact}</a>
                        </CardContent>
                    </Card>
                )}

                {contactInfo.medical_contact && (
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Stethoscope className="h-6 w-6 text-green-500" />
                                <div>
                                    <div className="font-bold">Médico</div>
                                    <div className="text-xs text-gray-500">Centro Salud / Urgencias</div>
                                </div>
                            </div>
                            <a href={`tel:${contactInfo.medical_contact}`} className="text-lg font-bold text-green-600 hover:underline">{contactInfo.medical_contact}</a>
                        </CardContent>
                    </Card>
                )}

                {contactInfo.fire_contact && (
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Flame className="h-6 w-6 text-orange-500" />
                                <div>
                                    <div className="font-bold">Bomberos</div>
                                </div>
                            </div>
                            <a href={`tel:${contactInfo.fire_contact}`} className="text-lg font-bold text-orange-600 hover:underline">{contactInfo.fire_contact}</a>
                        </CardContent>
                    </Card>
                )}
            </div>

            {contactInfo.emergency_numbers && typeof contactInfo.emergency_numbers === 'object' && (
                <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                    <p>Si tienes alguna duda urgente y no nos puedes contactar, recuerda que el <span className="font-bold">112</span> es el número de emergencias para toda Europa.</p>
                </div>
            )}
        </div>
    )
}
