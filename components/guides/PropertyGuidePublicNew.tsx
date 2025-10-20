"use client"

import { useState, useEffect } from "react"
import { useGuideData } from "@/hooks/useGuideData"
import { GuideNavigation } from "./GuideNavigation"
import { GuideHero } from "./GuideHero"
import { GuideWeatherWidget } from "./GuideWeatherWidget"
import { GuideApartmentSections } from "./GuideApartmentSections"
import { GuideBeachesSection } from "./GuideBeachesSection"
import { GuideRestaurantsSection } from "./GuideRestaurantsSection"
import { GuideActivitiesSection } from "./GuideActivitiesSection"
import { GuideContactSection } from "./GuideContactSection"
import { GuideValueProposition } from "./GuideValueProposition"
import { GuideFooter } from "./GuideFooter"

interface PropertyGuidePublicNewProps {
  propertyId: string
}

export function PropertyGuidePublicNew({ propertyId }: PropertyGuidePublicNewProps) {
  const { data, loading, error } = useGuideData(propertyId)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando guía...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error al cargar la guía</h1>
          <p className="text-muted-foreground">{error || "No se encontró información de la guía"}</p>
        </div>
      </div>
    )
  }

  console.log('[PropertyGuidePublicNew] Guide data:', data)
  console.log('[PropertyGuidePublicNew] Guide coordinates:', { 
    latitude: data.guide?.latitude, 
    longitude: data.guide?.longitude 
  })

  // Determinar qué secciones mostrar basado en si tienen contenido
  const hasApartmentSections = data.apartment_sections && data.apartment_sections.length > 0
  const hasBeaches = data.beaches && data.beaches.length > 0
  const hasRestaurants = data.restaurants && data.restaurants.length > 0
  const hasActivities = data.activities && data.activities.length > 0
  const hasContactInfo = data.contact_info !== null
  
  // Nombre del tenant/propiedad
  const tenantName = data.property?.name || "Propiedad"

  return (
    <main className="min-h-screen bg-background">
      <GuideNavigation 
        tenantName={tenantName}
        isScrolled={isScrolled}
        sections={{
          apartment: hasApartmentSections,
          beaches: hasBeaches,
          restaurants: hasRestaurants,
          activities: hasActivities,
          contact: hasContactInfo
        }}
      />
      
      <GuideHero 
        propertyName={tenantName}
        welcomeMessage={data.guide?.welcome_message || "Bienvenido a tu hogar temporal"}
      />
      
      <GuideWeatherWidget 
        latitude={data.guide?.latitude}
        longitude={data.guide?.longitude}
        locality={data.property?.locality}
      />
      
      <GuideValueProposition data={data} />
      
      {hasApartmentSections && (
        <GuideApartmentSections sections={data.apartment_sections} />
      )}
      
      {hasBeaches && (
        <GuideBeachesSection beaches={data.beaches} />
      )}
      
      {hasRestaurants && (
        <GuideRestaurantsSection restaurants={data.restaurants} />
      )}
      
      {hasActivities && (
        <GuideActivitiesSection activities={data.activities} />
      )}
      
      {hasContactInfo && data.contact_info && (
        <GuideContactSection contactInfo={data.contact_info} />
      )}
      
      <GuideFooter tenantName={tenantName} />
    </main>
  )
}
