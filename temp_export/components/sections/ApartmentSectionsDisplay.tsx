"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ApartmentSection } from "@/types/guides"

// Mapeo de tipos de sección a información básica (solo para fallbacks)
const SECTION_INFO = {
  cocina: {
    label: "Cocina",
    icon: "fas fa-utensils",
    color: "text-orange-500",
    badge: "Cocina"
  },
  bano: {
    label: "Baño",
    icon: "fas fa-shower",
    color: "text-blue-500",
    badge: "Baño"
  },
  salon: {
    label: "Salón",
    icon: "fas fa-couch",
    color: "text-green-500",
    badge: "Salón"
  },
  dormitorio: {
    label: "Dormitorio",
    icon: "fas fa-bed",
    color: "text-purple-500",
    badge: "Dormitorio"
  },
  terraza: {
    label: "Terraza",
    icon: "fas fa-sun",
    color: "text-yellow-500",
    badge: "Terraza"
  },
  entrada: {
    label: "Entrada",
    icon: "fas fa-door-open",
    color: "text-gray-500",
    badge: "Entrada"
  },
  balcon: {
    label: "Balcón",
    icon: "fas fa-wind",
    color: "text-cyan-500",
    badge: "Balcón"
  },
  garaje: {
    label: "Garaje",
    icon: "fas fa-car",
    color: "text-indigo-500",
    badge: "Garaje"
  }
} as const

interface ApartmentSectionsDisplayProps {
  sections: ApartmentSection[]
}

export function ApartmentSectionsDisplay({ sections }: ApartmentSectionsDisplayProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Detalles del Apartamento
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Descubre todas las áreas y comodidades de tu hogar temporal
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(sections || []).map((section) => {
              const sectionInfo = SECTION_INFO[section.section_type as keyof typeof SECTION_INFO] || {
                label: section.section_type,
                icon: section.icon || "fas fa-home",
                color: "text-gray-500",
                badge: section.section_type
              }
              
              return (
                <Card key={section.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Imagen de fondo - usar la imagen de la base de datos o un placeholder */}
                  <div 
                    className="h-48 bg-cover bg-center relative bg-gray-200"
                    style={{ 
                      backgroundImage: section.image_url 
                        ? `url(${section.image_url})` 
                        : 'none'
                    }}
                  >
                    {/* Badge en la esquina superior derecha */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-400 text-gray-800 font-semibold px-3 py-1 rounded-full text-sm">
                        {sectionInfo.badge}
                      </Badge>
                    </div>
                    
                    {/* Si no hay imagen, mostrar un placeholder con icono */}
                    {!section.image_url && (
                      <div className="flex items-center justify-center h-full">
                        <i className={`${sectionInfo.icon} text-6xl ${sectionInfo.color} opacity-50`}></i>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <i className={`${section.icon || sectionInfo.icon} text-2xl ${sectionInfo.color}`}></i>
                      <h3 className="text-xl font-semibold text-gray-800">{section.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{section.description}</p>
                    
                    {/* Mostrar detalles si existen */}
                    {section.details && (
                      <div className="text-xs text-gray-500">
                        <p className="font-medium mb-1">Detalles:</p>
                        <p>{section.details}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {(!sections || sections.length === 0) && (
            <div className="text-center py-12">
              <i className="fas fa-home text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No hay información del apartamento disponible en este momento</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}