"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useGuideData } from "@/hooks/useGuideData"
import { GuideHeader } from "./GuideHeader"
import { GuideSidebar } from "./GuideSidebar"
import { WelcomeSection } from "./WelcomeSection"
import { ApartmentSection } from "./sections/ApartmentSection"
import { HouseRulesSection } from "./sections/HouseRulesSection"
import { HouseGuideSection } from "./sections/HouseGuideSection"
import { TipsSection } from "./sections/TipsSection"
import { ShoppingSection } from "./sections/ShoppingSection"
import { BeachesSection } from "./sections/BeachesSection"
import { RestaurantsSection } from "./sections/RestaurantsSection"
import { ActivitiesSection } from "./sections/ActivitiesSection"
import { ContactSection } from "./sections/ContactSection"
import { WeatherSection } from "./sections/WeatherSection"
import {
    Loader2, AlertTriangle, Home, ClipboardList, Book, Lightbulb,
    Umbrella, Utensils, Mountain, Phone, Sparkles, CloudSun, ShoppingBag
} from "lucide-react"
import { getIconByName } from "@/lib/utils/icon-registry"
import { themeConfigs, hexToRgb } from "@/lib/utils/themes"
import { Button } from "@/components/ui/button"
import { getGuideThemePublic } from "@/lib/api/guides-public"
import { LanguageSelector, Language } from "./LanguageSelector"
import { CompleteGuideDataResponse } from "@/types/guides"

import { uiTranslations } from "@/lib/utils/ui-translations"

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
    const [theme, setTheme] = useState<string>("default")
    const [isThemeLoading, setIsThemeLoading] = useState(true)
    const { data: originalData, loading, error } = useGuideData(propertyId)

    // Estado para multi-idioma
    const [currentLanguage, setCurrentLanguage] = useState<Language>("es")
    const [translatedData, setTranslatedData] = useState<CompleteGuideDataResponse | null>(null)
    const [isTranslating, setIsTranslating] = useState(false)
    const [translationCache, setTranslationCache] = useState<Record<string, CompleteGuideDataResponse>>({})

    // Detectar idioma inicial desde el booking o navegador
    useEffect(() => {
        if (booking?.preferred_language) {
            setCurrentLanguage(booking.preferred_language as Language)
        } else if (typeof window !== "undefined") {
            const browserLang = navigator.language.split("-")[0] as Language
            if (["en", "fr", "de", "it"].includes(browserLang)) {
                setCurrentLanguage(browserLang)
            }
        }
    }, [booking])

    // Efecto para manejar la traducción
    useEffect(() => {
        if (currentLanguage === "es") {
            setTranslatedData(null)
            return
        }

        if (translationCache[currentLanguage]) {
            setTranslatedData(translationCache[currentLanguage])
            return
        }

        if (originalData) {
            const translateData = async () => {
                setIsTranslating(true)
                try {
                    const response = await fetch("/api/public/guides/translate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            data: originalData,
                            targetLanguage: currentLanguage
                        })
                    })
                    const result = await response.json()
                    if (result.data) {
                        setTranslationCache(prev => ({ ...prev, [currentLanguage]: result.data }))
                        setTranslatedData(result.data)
                    }
                } catch (err) {
                    console.error("Error translating guide:", err)
                } finally {
                    setIsTranslating(false)
                }
            }
            translateData()
        }
    }, [currentLanguage, originalData])

    const data = translatedData || originalData

    // Cargar tema de forma independiente para el spinner
    useEffect(() => {
        if (!propertyId) return
        const loadTheme = async () => {
            try {
                const themeData = await getGuideThemePublic(propertyId)
                if (themeData?.theme) {
                    setTheme(themeData.theme)
                }
            } catch (err) {
                console.error("Error loading theme for spinner:", err)
            } finally {
                setIsThemeLoading(false)
            }
        }
        loadTheme()
    }, [propertyId])

    const initialThemeConfig = themeConfigs[theme] || themeConfigs.default

    // Aplicar variables de tema al root para estilos globales (como el scrollbar)
    useEffect(() => {
        const config = themeConfigs[theme] || themeConfigs.default;
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
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({})
    const isScrollingProgrammatically = useRef(false)
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Función para hacer scroll suave a una sección (debe estar antes de los returns condicionales)
    const scrollToSection = useCallback((sectionId: string) => {
        const section = sectionRefs.current[sectionId]
        if (section) {
            isScrollingProgrammatically.current = true

            // Esperar un momento para que el DOM se actualice
            requestAnimationFrame(() => {
                // Calcular la altura del header según el tamaño de pantalla
                const isMobile = window.innerWidth < 768
                const headerHeight = isMobile ? 120 : 150
                const extraSpacing = 20 // Espacio adicional para que se vea bien el inicio

                // Obtener la posición relativa al documento usando getBoundingClientRect
                const rect = section.getBoundingClientRect()
                const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop
                const sectionTop = rect.top + currentScrollTop

                // Calcular la posición final considerando el header sticky
                const offsetPosition = sectionTop - headerHeight - extraSpacing

                window.scrollTo({
                    top: Math.max(0, offsetPosition), // Asegurar que no sea negativo
                    behavior: 'smooth'
                })

                // Resetear la bandera después de un tiempo
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current)
                }
                scrollTimeoutRef.current = setTimeout(() => {
                    isScrollingProgrammatically.current = false
                }, 1000)
            })
        }
    }, [])

    // Manejar cambio de tab con scroll suave (debe estar antes de los returns condicionales)
    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId)
        // Pequeño delay para asegurar que el DOM esté actualizado
        setTimeout(() => {
            scrollToSection(tabId)
        }, 50)
    }, [scrollToSection])

    // Limpiar timeout al desmontar (debe estar antes de los returns)
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }
        }
    }, [])

    // Scroll inicial a la sección de bienvenida cuando se carga la página
    useEffect(() => {
        if (!data) return

        // Esperar a que las secciones se rendericen
        const timeoutId = setTimeout(() => {
            // Primero, hacer scroll al inicio para asegurar que estamos en la parte superior
            window.scrollTo({ top: 0, behavior: 'auto' })

            // Luego, después de un pequeño delay, verificar si hay sección de bienvenida
            setTimeout(() => {
                const bienvenidaSection = sectionRefs.current["bienvenida"]
                if (bienvenidaSection) {
                    // La sección de bienvenida debería estar visible en la parte superior
                    // No necesitamos hacer scroll adicional si ya estamos en el inicio
                    setActiveTab("bienvenida")
                }
            }, 100)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [data])

    // Intersection Observer para detectar sección visible (antes de los returns, con guard)
    useEffect(() => {
        if (!data) return

        // Calcular tabs dentro del effect
        const tabs = [
            { id: "bienvenida", label: "Bienvenida", icon: getIconByName("Sparkles"), show: !!data.guide.welcome_message },
            { id: "apartamento", label: "Apartamento", icon: getIconByName("Home"), show: data.apartment_sections?.length > 0 },
            { id: "tiempo", label: "Tiempo actual", icon: getIconByName("CloudSun"), show: !!(data.guide.latitude && data.guide.longitude) },
            { id: "normas", label: "Normas", icon: getIconByName("ClipboardList"), show: data.house_rules?.length > 0 },
            { id: "guia-casa", label: "Guía Casa", icon: getIconByName("Book"), show: data.house_guide_items?.length > 0 },
            { id: "consejos", label: "Consejos", icon: getIconByName("Lightbulb"), show: data.tips?.length > 0 },
            { id: "compras", label: "Compras", icon: getIconByName("ShoppingBag"), show: data.shopping?.length > 0 },
            { id: "playas", label: "Playas", icon: getIconByName("Umbrella"), show: data.beaches?.length > 0 },
            { id: "restaurantes", label: "Restaurantes", icon: getIconByName("Utensils"), show: data.restaurants?.length > 0 },
            { id: "actividades", label: "Actividades", icon: getIconByName("Mountain"), show: data.activities?.length > 0 },
            { id: "contacto", label: "Contacto", icon: getIconByName("Phone"), show: !!data.contact_info },
        ].filter(tab => tab.show)

        if (tabs.length === 0) return

        let observer: IntersectionObserver | null = null

        // Esperar a que las secciones se rendericen
        const timeoutId = setTimeout(() => {
            // Calcular el rootMargin según el tamaño de pantalla
            const isMobile = window.innerWidth < 768
            const headerHeight = isMobile ? 120 : 150

            observer = new IntersectionObserver(
                (entries) => {
                    // Solo actualizar si no estamos haciendo scroll programático
                    if (isScrollingProgrammatically.current) return

                    // Encontrar la sección más visible
                    const visibleSections = entries
                        .filter(entry => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

                    if (visibleSections.length > 0) {
                        const mostVisible = visibleSections[0]
                        const sectionId = mostVisible.target.getAttribute('data-section-id')

                        if (sectionId && sectionId !== activeTab) {
                            setActiveTab(sectionId)
                        }
                    }
                },
                {
                    threshold: [0.1, 0.3, 0.5, 0.7],
                    rootMargin: `-${headerHeight}px 0px -50% 0px` // Considerar el header sticky (responsivo)
                }
            )

            // Observar todas las secciones
            Object.values(sectionRefs.current).forEach(section => {
                if (section) {
                    observer?.observe(section)
                }
            })
        }, 100)

        return () => {
            clearTimeout(timeoutId)
            if (observer) {
                observer.disconnect()
            }
        }
    }, [data, activeTab])

    // Scroll automático a la siguiente sección al llegar al final (antes de los returns, con guard)
    useEffect(() => {
        if (!data) return

        // Calcular tabs dentro del effect
        const tabs = [
            { id: "bienvenida", label: "Bienvenida", icon: Sparkles, show: !!data.guide.welcome_message },
            { id: "apartamento", label: "Apartamento", icon: Home, show: data.apartment_sections?.length > 0 },
            { id: "tiempo", label: "Tiempo actual", icon: CloudSun, show: !!(data.guide.latitude && data.guide.longitude) },
            { id: "normas", label: "Normas", icon: ClipboardList, show: data.house_rules?.length > 0 },
            { id: "guia-casa", label: "Guía Casa", icon: Book, show: data.house_guide_items?.length > 0 },
            { id: "consejos", label: "Consejos", icon: Lightbulb, show: data.tips?.length > 0 },
            { id: "compras", label: "Compras", icon: ShoppingBag, show: data.shopping?.length > 0 && data.sections.some(s => s.section_type === 'shopping') },
            { id: "playas", label: "Playas", icon: Umbrella, show: data.beaches?.length > 0 && data.sections.some(s => s.section_type === 'beaches') },
            { id: "restaurantes", label: "Restaurantes", icon: Utensils, show: data.restaurants?.length > 0 && data.sections.some(s => s.section_type === 'restaurants') },
            { id: "actividades", label: "Actividades", icon: Mountain, show: data.activities?.length > 0 && data.sections.some(s => s.section_type === 'activities') },
            { id: "contacto", label: "Contacto", icon: Phone, show: !!data.contact_info },
        ].filter(tab => tab.show)

        if (tabs.length === 0) return

        let scrollTimeout: NodeJS.Timeout | null = null
        let lastScrollY = window.scrollY
        let scrollDirection: 'up' | 'down' | null = null
        let autoScrollCooldown = false

        const handleScroll = () => {
            if (isScrollingProgrammatically.current) return

            const currentScrollY = window.scrollY
            scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up'
            lastScrollY = currentScrollY

            // Solo activar scroll automático si el usuario está haciendo scroll hacia abajo
            if (scrollDirection !== 'down' || autoScrollCooldown) return

            const currentIndex = tabs.findIndex(t => t.id === activeTab)
            if (currentIndex === -1 || currentIndex === tabs.length - 1) return

            const currentSection = sectionRefs.current[activeTab]
            if (!currentSection) return

            const rect = currentSection.getBoundingClientRect()
            const windowHeight = window.innerHeight

            // Solo activar si el usuario está muy cerca del final (últimos 50px) y haciendo scroll hacia abajo
            // Esto evita que se active automáticamente cuando simplemente está viendo la sección
            if (rect.bottom <= windowHeight + 50 && rect.bottom >= windowHeight - 20 && scrollDirection === 'down') {
                const nextTab = tabs[currentIndex + 1]
                if (nextTab && !scrollTimeout) {
                    // Activar cooldown para evitar múltiples activaciones
                    autoScrollCooldown = true

                    // Pequeño delay para evitar scrolls múltiples
                    scrollTimeout = setTimeout(() => {
                        if (!isScrollingProgrammatically.current && scrollDirection === 'down') {
                            scrollToSection(nextTab.id)
                            setActiveTab(nextTab.id)
                        }
                        scrollTimeout = null
                        // Resetear cooldown después de un tiempo
                        setTimeout(() => {
                            autoScrollCooldown = false
                        }, 2000)
                    }, 800) // Aumentar el delay para que sea menos agresivo
                }
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (scrollTimeout) {
                clearTimeout(scrollTimeout)
            }
        }
    }, [activeTab, scrollToSection, data])

    if (loading || isThemeLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2
                        className="h-12 w-12 animate-spin mx-auto mb-4"
                        style={{ color: isThemeLoading ? '#d1d5db' : initialThemeConfig.primary }}
                    />
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

    const currentTheme = (data?.guide as any)?.theme || theme;

    // La configuración de temas está ahora en @/lib/utils/themes
    const themeConfig = themeConfigs[currentTheme] || themeConfigs.default;

    const t = uiTranslations[currentLanguage] || uiTranslations["es"]

    // Definición de tabs basada en disponibilidad de datos
    const tabs = [
        { id: "bienvenida", label: t.welcome, icon: getIconByName("Sparkles"), show: !!data.guide.welcome_message },
        { id: "apartamento", label: t.apartment, icon: getIconByName("Home"), show: data.apartment_sections?.length > 0 },
        { id: "tiempo", label: t.today, icon: getIconByName("CloudSun"), show: !!(data.guide.latitude && data.guide.longitude) },
        { id: "normas", label: t.house_rules, icon: getIconByName("ClipboardList"), show: data.house_rules?.length > 0 },
        { id: "guia-casa", label: t.house_guide, icon: getIconByName("Book"), show: data.house_guide_items?.length > 0 },
        { id: "consejos", label: t.tips, icon: getIconByName("Lightbulb"), show: data.tips?.length > 0 },
        { id: "compras", label: t.shopping, icon: getIconByName("ShoppingBag"), show: data.shopping?.length > 0 && data.sections.some(s => s.section_type === 'shopping') },
        { id: "playas", label: t.beaches, icon: getIconByName("Umbrella"), show: data.beaches?.length > 0 && data.sections.some(s => s.section_type === 'beaches') },
        { id: "restaurantes", label: t.restaurants, icon: getIconByName("Utensils"), show: data.restaurants?.length > 0 && data.sections.some(s => s.section_type === 'restaurants') },
        { id: "actividades", label: t.activities, icon: getIconByName("Mountain"), show: data.activities?.length > 0 && data.sections.some(s => s.section_type === 'activities') },
        { id: "contacto", label: t.contact, icon: getIconByName("Phone"), show: !!data.contact_info },
    ].filter(tab => tab.show)

    // Función para renderizar todas las secciones con IDs únicos
    const renderAllSections = () => {
        const sections: React.ReactElement[] = []

        // Recopilar imágenes para el collage
        const collageImages = data.apartment_sections
            .filter(s => s.image_url)
            .map(s => s.image_url!)
            .slice(0, 2)

        // Bienvenida
        if (tabs.find(t => t.id === "bienvenida")) {
            sections.push(
                <section key="bienvenida" data-section-id="bienvenida" ref={(el) => { sectionRefs.current["bienvenida"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <WelcomeSection
                        guide={data.guide}
                        images={collageImages}
                        property={data.property}
                        currentLanguage={currentLanguage}
                    />
                </section>
            )
        }

        // Apartamento
        if (tabs.find(t => t.id === "apartamento")) {
            const apartmentIntro = data.sections.find(s => s.section_type === "apartment")
            sections.push(
                <section key="apartamento" data-section-id="apartamento" ref={(el) => { sectionRefs.current["apartamento"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <ApartmentSection
                        apartmentSections={data.apartment_sections}
                        property={data.property}
                        introSection={apartmentIntro}
                        currentLanguage={currentLanguage}
                    />
                </section>
            )
        }

        // Tiempo
        if (tabs.find(t => t.id === "tiempo")) {
            sections.push(
                <section key="tiempo" data-section-id="tiempo" ref={(el) => { sectionRefs.current["tiempo"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <WeatherSection
                        latitude={data.guide.latitude}
                        longitude={data.guide.longitude}
                        propertyName={data.property.name}
                        locality={data.property.locality}
                        currentLanguage={currentLanguage}
                    />
                </section>
            )
        }

        // Normas
        if (tabs.find(t => t.id === "normas")) {
            const rulesIntro = data.sections.find(s => s.section_type === "rules")
            sections.push(
                <section key="normas" data-section-id="normas" ref={(el) => { sectionRefs.current["normas"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <HouseRulesSection rules={data.house_rules} introSection={rulesIntro} currentLanguage={currentLanguage} />
                </section>
            )
        }

        // Guía Casa
        if (tabs.find(t => t.id === "guia-casa")) {
            const houseGuideIntro = data.sections.find(s => s.section_type === "house_guide")
            sections.push(
                <section key="guia-casa" data-section-id="guia-casa" ref={(el) => { sectionRefs.current["guia-casa"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <HouseGuideSection items={data.house_guide_items} introSection={houseGuideIntro} />
                </section>
            )
        }

        // Consejos
        if (tabs.find(t => t.id === "consejos")) {
            const tipsIntro = data.sections.find(s => s.section_type === "tips")
            sections.push(
                <section key="consejos" data-section-id="consejos" ref={(el) => { sectionRefs.current["consejos"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <TipsSection tips={data.tips} introSection={tipsIntro} />
                </section>
            )
        }

        // Compras
        if (tabs.find(t => t.id === "compras")) {
            const shoppingIntro = data.sections.find(s => s.section_type === "shopping")
            sections.push(
                <section key="compras" data-section-id="compras" ref={(el) => { sectionRefs.current["compras"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <ShoppingSection shopping={data.shopping} introSection={shoppingIntro} />
                </section>
            )
        }

        // Playas
        if (tabs.find(t => t.id === "playas")) {
            const beachesIntro = data.sections.find(s => s.section_type === "beaches")
            sections.push(
                <section key="playas" data-section-id="playas" ref={(el) => { sectionRefs.current["playas"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <BeachesSection beaches={data.beaches} introSection={beachesIntro} />
                </section>
            )
        }

        // Restaurantes
        if (tabs.find(t => t.id === "restaurantes")) {
            const restaurantsIntro = data.sections.find(s => s.section_type === "restaurants")
            sections.push(
                <section key="restaurantes" data-section-id="restaurantes" ref={(el) => { sectionRefs.current["restaurantes"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <RestaurantsSection restaurants={data.restaurants} introSection={restaurantsIntro} />
                </section>
            )
        }

        // Actividades
        if (tabs.find(t => t.id === "actividades")) {
            const activitiesIntro = data.sections.find(s => s.section_type === "activities")
            sections.push(
                <section key="actividades" data-section-id="actividades" ref={(el) => { sectionRefs.current["actividades"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <ActivitiesSection activities={data.activities} introSection={activitiesIntro} />
                </section>
            )
        }

        // Contacto
        if (tabs.find(t => t.id === "contacto") && data.contact_info) {
            const contactIntro = data.sections.find(s => s.section_type === "contact")
            sections.push(
                <section key="contacto" data-section-id="contacto" ref={(el) => { sectionRefs.current["contacto"] = el }} className="scroll-mt-[140px] md:scroll-mt-[170px]">
                    <ContactSection contactInfo={data.contact_info} introSection={contactIntro} />
                </section>
            )
        }

        return sections
    }

    return (
        <div
            className="min-h-screen bg-gray-50"
            style={{
                '--guide-primary': themeConfig.primary,
                '--guide-primary-rgb': hexToRgb(themeConfig.primary),
                '--guide-secondary': themeConfig.secondary
            } as React.CSSProperties}
        >
            {/* Header (no sticky, se desplaza con el scroll) */}
            <GuideHeader
                guide={data.guide}
                onMenuClick={() => setIsMobileMenuOpen(true)}
                guestName={booking?.persons ? `${booking.persons.first_name} ${booking.persons.last_name}`.trim() : null}
                checkInDate={booking?.check_in_date || null}
                checkOutDate={booking?.check_out_date || null}
            >
                <LanguageSelector
                    currentLanguage={currentLanguage}
                    onLanguageChange={setCurrentLanguage}
                    isTranslating={isTranslating}
                />
            </GuideHeader>

            {/* Layout con sidebar y contenido */}
            <div className="flex relative">
                {/* Sidebar (desktop) y Sheet (móvil) */}
                <GuideSidebar
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    isMobileOpen={isMobileMenuOpen}
                    onMobileOpenChange={setIsMobileMenuOpen}
                />

                {/* Contenido principal */}
                <main className="flex-1 min-w-0">
                    <div className="container mx-auto px-4 pt-6 pb-6">
                        <div id="sections-container" className="space-y-12">
                            {renderAllSections()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
