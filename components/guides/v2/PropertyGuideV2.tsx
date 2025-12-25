"use client"

import { useState } from "react"
import { useGuideData } from "@/hooks/useGuideData"
import { GuideHeader } from "./GuideHeader"
import { GuideSidebar } from "./GuideSidebar"
import { WelcomeSection } from "./WelcomeSection"
import { ApartmentSection } from "./sections/ApartmentSection"
import { HouseRulesSection } from "./sections/HouseRulesSection"
import { HouseGuideSection } from "./sections/HouseGuideSection"
import { TipsSection } from "./sections/TipsSection"
import { BeachesSection } from "./sections/BeachesSection"
import { RestaurantsSection } from "./sections/RestaurantsSection"
import { ActivitiesSection } from "./sections/ActivitiesSection"
import { ContactSection } from "./sections/ContactSection"
import { PracticalInfoSection } from "./sections/PracticalInfoSection"
import { WeatherSection } from "./sections/WeatherSection"
import { Loader2, AlertTriangle, Home, ClipboardList, Book, Lightbulb, Umbrella, Utensils, Mountain, Phone, Info, Sparkles, CloudSun } from "lucide-react"

interface PropertyGuideV2Props {
    propertyId: string
    booking?: any | null
}

export function PropertyGuideV2({ propertyId, booking }: PropertyGuideV2Props) {
    // LOG CRÍTICO: Si este componente se renderiza, significa que se saltó el login
    console.log("=".repeat(80))
    console.log("🔴🔴🔴 [PropertyGuideV2] RENDERING DIRECTLY - THIS SHOULD NOT HAPPEN WITHOUT LOGIN 🔴🔴🔴")
    console.log("🔴 [PropertyGuideV2] propertyId:", propertyId)
    console.log("🔴 [PropertyGuideV2] This component should ONLY render after authentication")
    console.log("=".repeat(80))
    
    const [activeTab, setActiveTab] = useState("bienvenida")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { data, loading, error } = useGuideData(propertyId)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando guía...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600">Error al cargar la guía</p>
                    <p className="text-sm text-gray-400 mt-2">{error || "No se encontraron datos"}</p>
                </div>
            </div>
        )
    }

    // Definición de tabs basada en disponibilidad de datos
    const tabs = [
        { id: "bienvenida", label: "Bienvenida", icon: Sparkles, show: !!data.guide.welcome_message },
        { id: "apartamento", label: "Apartamento", icon: Home, show: true },
        { id: "tiempo", label: "Tiempo actual", icon: CloudSun, show: !!(data.guide.latitude && data.guide.longitude) },
        { id: "normas", label: "Normas", icon: ClipboardList, show: data.house_rules?.length > 0 },
        { id: "guia-casa", label: "Guía Casa", icon: Book, show: data.house_guide_items?.length > 0 },
        { id: "consejos", label: "Consejos", icon: Lightbulb, show: data.tips?.length > 0 },
        { id: "playas", label: "Playas", icon: Umbrella, show: data.beaches?.length > 0 },
        { id: "restaurantes", label: "Restaurantes", icon: Utensils, show: data.restaurants?.length > 0 },
        { id: "actividades", label: "Actividades", icon: Mountain, show: data.activities?.length > 0 },
        { id: "practica", label: "Info Práctica", icon: Info, show: data.practical_info?.length > 0 },
        { id: "contacto", label: "Contacto", icon: Phone, show: !!data.contact_info },
    ].filter(tab => tab.show)

    const renderActiveSection = () => {
        switch (activeTab) {
            case "bienvenida":
                // Recopilar imágenes para el collage (priorizar salón/comedor, luego otras)
                const collageImages = data.apartment_sections
                    .filter(s => s.image_url)
                    .map(s => s.image_url!)
                    .slice(0, 2)

                return <WelcomeSection
                    guide={data.guide}
                    images={collageImages}
                    property={data.property}
                />
            case "apartamento":
                // Buscamos si hay una sección genérica de tipo 'apartment' para la intro
                const apartmentIntro = data.sections.find(s => s.section_type === "apartment")
                return <ApartmentSection
                    apartmentSections={data.apartment_sections}
                    property={data.property}
                    introSection={apartmentIntro}
                />
            case "tiempo":
                return <WeatherSection
                    latitude={data.guide.latitude}
                    longitude={data.guide.longitude}
                    propertyName={data.property.name}
                    locality={data.property.locality}
                />
            case "normas":
                return <HouseRulesSection rules={data.house_rules} />
            case "guia-casa":
                return <HouseGuideSection items={data.house_guide_items} />
            case "consejos":
                const tipsIntro = data.sections.find(s => s.section_type === "tips")
                return <TipsSection tips={data.tips} introSection={tipsIntro} />
            case "playas":
                return <BeachesSection beaches={data.beaches} />
            case "restaurantes":
                return <RestaurantsSection restaurants={data.restaurants} />
            case "actividades":
                return <ActivitiesSection activities={data.activities} />
            case "practica":
                return <PracticalInfoSection info={data.practical_info} />
            case "contacto":
                return data.contact_info ? <ContactSection contactInfo={data.contact_info} /> : null
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header (no sticky, se desplaza con el scroll) */}
            <GuideHeader 
                guide={data.guide} 
                onMenuClick={() => setIsMobileMenuOpen(true)}
                guestName={booking?.persons ? `${booking.persons.first_name} ${booking.persons.last_name}`.trim() : null}
                checkInDate={booking?.check_in_date || null}
                checkOutDate={booking?.check_out_date || null}
            />

            {/* Layout con sidebar y contenido */}
            <div className="flex relative">
                {/* Sidebar (desktop) y Sheet (móvil) */}
                <GuideSidebar
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isMobileOpen={isMobileMenuOpen}
                    onMobileOpenChange={setIsMobileMenuOpen}
                />

                {/* Contenido principal */}
                <main className="flex-1 min-w-0">
                    <div className="container mx-auto px-4 py-6">
                        {renderActiveSection()}
                    </div>
                </main>
            </div>
        </div>
    )
}
