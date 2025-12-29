"use client"

import { useState, useEffect, useRef } from "react"
import { useGuideData } from "@/hooks/useGuideData"
import { BeachesEditForm } from "@/components/admin/BeachesEditForm"
import { RestaurantsEditForm } from "@/components/admin/RestaurantsEditForm"
import { ShoppingEditForm } from "@/components/admin/ShoppingEditForm"
import { ActivitiesEditForm } from "@/components/admin/ActivitiesEditForm"
import { ContactInfoEditForm } from "@/components/admin/ContactInfoEditForm"
import { createGuideSection, updateGuideSection, deleteGuideSection, createGuide, updateGuide } from "@/lib/api/guides-client"
import { SectionManager } from "@/components/admin/SectionManager"
import { HouseRulesManager } from "@/components/admin/HouseRulesManager"
import { HouseGuideManager } from "@/components/admin/HouseGuideManager"
import { TipsManager } from "@/components/admin/TipsManager"
import { ApartmentSectionsManager } from "@/components/admin/ApartmentSectionsManager"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import type { Guide, GuideSection } from "@/types/guides"

interface PropertyGuideManagerProps {
  propertyId: string
}

export function PropertyGuideManager({ propertyId }: PropertyGuideManagerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [formData, setFormData] = useState({
    title: "",
    welcome_message: "",
    host_names: "",
    host_signature: "",
    locality: "",
    latitude: "",
    longitude: "",
  })
  const [sections, setSections] = useState<GuideSection[]>([])
  const [beaches, setBeaches] = useState<any[]>([])
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [shopping, setShopping] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [showAddSection, setShowAddSection] = useState(false)
  const [editingSection, setEditingSection] = useState<GuideSection | null>(null)
  const [newSection, setNewSection] = useState<{
    section_type: "apartment" | "rules" | "house_guide" | "tips" | "contact"
    title: string
    content: string
    icon: string
  }>({
    section_type: "apartment",
    title: "",
    content: "",
    icon: "fas fa-home"
  })
  const isInitialLoad = useRef(true)

  const { data, loading, error, refetch } = useGuideData(propertyId)

  // Actualizar formData cuando se cargan los datos
  useEffect(() => {
    if (data?.guide) {
      setFormData({
        title: data.guide.title || "",
        welcome_message: data.guide.welcome_message || "",
        host_names: data.guide.host_names || "",
        host_signature: data.guide.host_signature || "",
        locality: (data.guide as any).locality || data.property?.locality || "",
        latitude: data.guide.latitude?.toString() || "",
        longitude: data.guide.longitude?.toString() || "",
      })
    }
    if (data?.sections) {
      setSections(data.sections)
      if (isInitialLoad.current) {
        isInitialLoad.current = false
      }
    }
    if (data?.beaches) {
      setBeaches(data.beaches)
    }
    if (data?.restaurants) {
      setRestaurants(data.restaurants)
    }
    if (data?.shopping) {
      setShopping(data.shopping)
    }
    if (data?.activities) {
      setActivities(data.activities)
    }
  }, [data])

  // Funciones para verificar si existe una sección de cada tipo
  const hasSectionType = (type: string) => {
    if (type === 'apartment') {
      return data?.apartment_sections && data.apartment_sections.length > 0
    }
    return sections.some(section => section.section_type === type)
  }

  const getSectionByType = (type: string): GuideSection | null => {
    return sections.find(section => section.section_type === type) || null
  }

  const handleSectionChange = async (updatedSection: GuideSection) => {
    if (!data?.guide?.id) return
    
    try {
      if (updatedSection.id) {
        // Actualizar sección existente
        const result = await updateGuideSection(updatedSection.id, {
          title: updatedSection.title,
          content: updatedSection.content,
          icon: updatedSection.icon
        })
        
        if (result) {
          setSections(prevSections => 
            prevSections.map(section => 
              section.id === updatedSection.id ? { ...section, ...updatedSection } : section
            )
          )
        }
      } else {
        // Crear nueva sección
        const result = await createGuideSection({
          guide_id: data.guide.id,
          section_type: updatedSection.section_type,
          title: updatedSection.title,
          content: updatedSection.content,
          icon: updatedSection.icon,
          order_index: sections.length + 1
        })
        
        if (result) {
          setSections(prevSections => [...prevSections, result])
        }
      }
    } catch (error) {
      console.error('Error saving section:', error)
    }
  }

  const handleAddSection = async () => {
    if (!data?.guide?.id) return
    
    // Si estamos editando, usar la función de actualización
    if (editingSection) {
      await handleUpdateSection()
      return
    }
    
    try {
      console.log('Creating new section:', newSection)
      
      const sectionData = {
        guide_id: data.guide.id,
        section_type: newSection.section_type,
        title: newSection.title,
        content: newSection.content,
        icon: newSection.icon || "fas fa-home",
        order_index: sections.length,
        is_active: true,
      }
      
      const createdSection = await createGuideSection(sectionData)
      
      if (createdSection) {
        console.log('Section created successfully:', createdSection)
        
        setSections(prevSections => {
          const newSections = [...prevSections, createdSection]
          console.log('Previous sections:', prevSections)
          console.log('New sections after adding:', newSections)
          return newSections
        })
        
        setNewSection({
          section_type: "apartment",
          title: "",
          content: "",
          icon: "",
        })
        setShowAddSection(false)
      }
    } catch (error) {
      console.error('Error creating section:', error)
    }
  }

  const handleEditSection = (section: GuideSection) => {
    setEditingSection(section)
    setNewSection({
      section_type: section.section_type,
      title: section.title || "",
      content: section.content || "",
      icon: section.icon || "fas fa-home"
    })
    setShowAddSection(true)
  }

  const handleUpdateSection = async () => {
    if (!editingSection) return
    
    try {
      console.log('Updating section:', editingSection.id, newSection)
      
      const updatedSection = await updateGuideSection(editingSection.id, {
        section_type: newSection.section_type,
        title: newSection.title,
        content: newSection.content,
      })
      
      if (updatedSection) {
        console.log('Section updated successfully:', updatedSection)
        
        setSections(prevSections => 
          prevSections.map(section => 
            section.id === editingSection.id ? updatedSection : section
          )
        )
        
        setEditingSection(null)
        setNewSection({
          section_type: "apartment",
          title: "",
          content: "",
          icon: "",
        })
        setShowAddSection(false)
      }
    } catch (error) {
      console.error('Error updating section:', error)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sección?')) return
    
    try {
      console.log('Deleting section:', sectionId)
      
      await deleteGuideSection(sectionId)
      
      setSections(prevSections => 
        prevSections.filter(section => section.id !== sectionId)
      )
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log("Saving guide:", formData)
      
      if (data?.guide?.id) {
        // Actualizar guía existente
        const updatedGuide = await updateGuide(data.guide.id, {
          title: formData.title,
          welcome_message: formData.welcome_message,
          host_names: formData.host_names,
          host_signature: formData.host_signature,
          locality: formData.locality || undefined,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        })
        
        if (updatedGuide) {
          console.log("Guide updated successfully:", updatedGuide)
          alert("Guía actualizada correctamente")
          refetch()
        } else {
          throw new Error("No se pudo actualizar la guía")
        }
      } else {
        // Crear nueva guía
        const newGuide = await createGuide({
          property_id: propertyId,
          title: formData.title,
          welcome_message: formData.welcome_message,
          host_names: formData.host_names,
          host_signature: formData.host_signature,
          locality: formData.locality || undefined,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        })
        
        if (newGuide) {
          console.log("Guide created successfully:", newGuide)
          alert("Guía creada correctamente")
          refetch()
        } else {
          throw new Error("No se pudo crear la guía")
        }
      }
    } catch (error) {
      console.error("Error saving guide:", error)
      alert("Error al guardar la guía: " + (error instanceof Error ? error.message : 'Error desconocido'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <p className="text-gray-600">Error al cargar los datos</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <div className="mt-4 space-x-2">
            <Button asChild>
              <Link href="/dashboard/properties">Volver a Propiedades</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/guides">Ir a Guías</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-book text-4xl text-blue-500 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay guía para esta propiedad</h2>
          <p className="text-gray-600 mb-4">Puedes crear una guía del huésped para esta propiedad</p>
          <div className="mt-4 space-x-2">
            <Button asChild>
              <Link href="/dashboard/guides">Crear Guía</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/properties">Volver a Propiedades</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/guides">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Volver
                </Link>
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Editar Guía: {data.property?.name || 'Propiedad'}</h1>
                <p className="text-sm text-gray-600">{data.property?.address || 'Dirección no disponible'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:ml-auto">
              <Badge variant="default">Editando</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Móvil: Select */}
          <div className="block md:hidden">
            <Label htmlFor="tab-select" className="mb-2 block">
              Sección
            </Label>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger id="tab-select" className="w-full">
                <SelectValue placeholder="Seleccione una sección" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Resumen</SelectItem>
                <SelectItem value="guide">Guía</SelectItem>
                {hasSectionType('apartment') && (
                  <SelectItem value="apartment">Apartamento</SelectItem>
                )}
                {hasSectionType('rules') && (
                  <SelectItem value="rules">Normas</SelectItem>
                )}
                {hasSectionType('house_guide') && (
                  <SelectItem value="house_guide">Guía Casa</SelectItem>
                )}
                {hasSectionType('tips') && (
                  <SelectItem value="tips">Consejos</SelectItem>
                )}
                {hasSectionType('contact') && (
                  <SelectItem value="contact">Contacto</SelectItem>
                )}
                <SelectItem value="beaches">Playas</SelectItem>
                <SelectItem value="restaurants">Restaurantes</SelectItem>
                <SelectItem value="shopping">Compras</SelectItem>
                <SelectItem value="activities">Actividades</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Tabs */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-11">
              <TabsTrigger value="overview" className="text-xs">
                Resumen
              </TabsTrigger>
              <TabsTrigger value="guide" className="text-xs">
                Guía
              </TabsTrigger>
              <TabsTrigger 
                value="apartment" 
                className="text-xs"
                disabled={!hasSectionType('apartment')}
              >
                Apartamento
              </TabsTrigger>
              <TabsTrigger 
                value="rules" 
                className="text-xs"
                disabled={!hasSectionType('rules')}
              >
                Normas
              </TabsTrigger>
              <TabsTrigger 
                value="house_guide" 
                className="text-xs"
                disabled={!hasSectionType('house_guide')}
              >
                Guía Casa
              </TabsTrigger>
              <TabsTrigger 
                value="tips" 
                className="text-xs"
                disabled={!hasSectionType('tips')}
              >
                Consejos
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="text-xs"
                disabled={!hasSectionType('contact')}
              >
                Contacto
              </TabsTrigger>
              <TabsTrigger value="beaches" className="text-xs">
                Playas
              </TabsTrigger>
              <TabsTrigger value="restaurants" className="text-xs">
                Restaurantes
              </TabsTrigger>
              <TabsTrigger value="shopping" className="text-xs">
                Compras
              </TabsTrigger>
              <TabsTrigger value="activities" className="text-xs">
                Actividades
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-chart-bar text-blue-600"></i>
                    Resumen de la Guía
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <i className="fas fa-list text-2xl text-blue-600 mb-2"></i>
                      <p className="font-semibold">{data.apartment_sections?.length || 0}</p>
                      <p className="text-sm text-gray-600">Secciones</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <i className="fas fa-umbrella-beach text-2xl text-green-600 mb-2"></i>
                      <p className="font-semibold">{data.beaches.length}</p>
                      <p className="text-sm text-gray-600">Playas</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <i className="fas fa-utensils text-2xl text-orange-600 mb-2"></i>
                      <p className="font-semibold">{data.restaurants.length}</p>
                      <p className="text-sm text-gray-600">Restaurantes</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <i className="fas fa-shopping-bag text-2xl text-blue-600 mb-2"></i>
                      <p className="font-semibold">{data.shopping?.length || 0}</p>
                      <p className="text-sm text-gray-600">Compras</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <i className="fas fa-hiking text-2xl text-purple-600 mb-2"></i>
                      <p className="font-semibold">{data.activities.length}</p>
                      <p className="text-sm text-gray-600">Actividades</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-info-circle text-blue-600"></i>
                    Información de la Propiedad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Nombre:</strong> {data.property?.name || 'No disponible'}</p>
                    <p><strong>Dirección:</strong> {data.property?.address || 'No disponible'}</p>
                    <p><strong>Descripción:</strong> {data.property?.description || 'No disponible'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guide">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-book text-blue-600"></i>
                    Información General de la Guía
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título de la Guía</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Guía del Huésped"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="host_names">Nombres de los Anfitriones</Label>
                      <Input
                        id="host_names"
                        value={formData.host_names}
                        onChange={(e) => setFormData({ ...formData, host_names: e.target.value })}
                        placeholder="Ej: Sonia y Pedro"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locality">Localidad (opcional)</Label>
                      <Input
                        id="locality"
                        value={formData.locality}
                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                        placeholder="Ej: Vera, Almería"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="welcome_message">Mensaje de Bienvenida</Label>
                      <Textarea
                        id="welcome_message"
                        value={formData.welcome_message}
                        onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                        placeholder="Mensaje de bienvenida para los huéspedes"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="host_signature">Firma de los Anfitriones</Label>
                      <Input
                        id="host_signature"
                        value={formData.host_signature}
                        onChange={(e) => setFormData({ ...formData, host_signature: e.target.value })}
                        placeholder="Ej: Con cariño, Sonia y Pedro"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-blue-600"></i>
                        <h3 className="text-lg font-semibold">Ubicación para el Clima</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Agrega las coordenadas de la propiedad para mostrar información meteorológica en la guía pública.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitud</Label>
                          <Input
                            id="latitude"
                            type="number"
                            step="0.0000001"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            placeholder="Ej: 37.2434"
                          />
                          <p className="text-xs text-gray-500">
                            Rango: -90 a 90. Ejemplo para Vera, Almería: 37.2434
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitud</Label>
                          <Input
                            id="longitude"
                            type="number"
                            step="0.0000001"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            placeholder="Ej: -1.8591"
                          />
                          <p className="text-xs text-gray-500">
                            Rango: -180 a 180. Ejemplo para Vera, Almería: -1.8591
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <i className="fas fa-info-circle mr-2"></i>
                          <strong>Consejo:</strong> Puedes obtener las coordenadas exactas usando Google Maps. 
                          Busca tu dirección y haz clic derecho → "¿Qué hay aquí?" para obtener las coordenadas.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                      <Button type="submit" className="w-full md:w-auto">
                        <i className="fas fa-save mr-2"></i>
                        Guardar Cambios
                      </Button>
                      <Button type="button" variant="outline" className="w-full md:w-auto">
                        <i className="fas fa-undo mr-2"></i>
                        Descartar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-list text-blue-600"></i>
                    Secciones de la Guía
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <i className={`${section.icon || 'fas fa-info-circle'} text-blue-600`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{section.title}</h4>
                              <p className="text-xs text-gray-500 capitalize">{section.section_type}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditSection(section)}
                              className="flex-1 md:flex-initial"
                            >
                              <i className="fas fa-edit mr-2"></i>
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteSection(section.id)}
                              className="flex-shrink-0"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 break-words">{section.content}</p>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      className="w-full bg-transparent"
                      onClick={() => setShowAddSection(true)}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Agregar Nueva Sección
                    </Button>
                    
                    {showAddSection && (
                      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-semibold mb-3">
                          {editingSection ? 'Editar Sección' : 'Nueva Sección'}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="section_type">Tipo de Sección</Label>
                            <select
                              id="section_type"
                              value={newSection.section_type}
                              onChange={(e) => setNewSection({ ...newSection, section_type: e.target.value as any })}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="apartment">Apartamento</option>
                              <option value="rules">Normas</option>
                              <option value="house_guide">Guía de la Casa</option>
                              <option value="tips">Consejos</option>
                              <option value="contact">Contacto</option>
                            </select>
                          </div>
                          
                          <div>
                            <Label htmlFor="section_icon">Icono (Font Awesome)</Label>
                            <Input
                              id="section_icon"
                              value={newSection.icon}
                              onChange={(e) => setNewSection({ ...newSection, icon: e.target.value })}
                              placeholder="fas fa-home"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="section_title">Título</Label>
                            <Input
                              id="section_title"
                              value={newSection.title}
                              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                              placeholder="Título de la sección"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="section_content">Contenido</Label>
                            <Textarea
                              id="section_content"
                              value={newSection.content}
                              onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                              placeholder="Contenido de la sección"
                              rows={4}
                            />
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-2">
                            <Button onClick={handleAddSection} size="sm" className="w-full md:w-auto">
                              <i className="fas fa-save mr-2"></i>
                              {editingSection ? 'Actualizar Sección' : 'Guardar Sección'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setShowAddSection(false)
                                setEditingSection(null)
                                setNewSection({ section_type: "apartment", title: "", content: "", icon: "fas fa-home" })
                              }}
                              className="w-full md:w-auto"
                            >
                              <i className="fas fa-times mr-2"></i>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="apartment">
            <div className="space-y-6">
              {data?.guide?.id && (
                <ApartmentSectionsManager 
                  guideId={data.guide.id}
                  propertyId={propertyId}
                  apartmentSections={data.apartment_sections || []}
                  onDataChange={refetch} 
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="rules">
            <div className="space-y-6">
              {data?.guide?.id && (
                <HouseRulesManager guideId={data.guide.id} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="house_guide">
            <div className="space-y-6">
              {data?.guide?.id && (
                <HouseGuideManager guideId={data.guide.id} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="tips">
            <div className="space-y-6">
              {data?.guide?.id && (
                <TipsManager guideId={data.guide.id} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="contact">
            {data?.guide?.id ? (
              <ContactInfoEditForm guideId={data.guide.id} />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                  <p className="text-gray-600">No se puede gestionar contactos sin una guía creada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="beaches">
            {data?.guide?.id ? (
              <BeachesEditForm 
                beaches={beaches} 
                guideId={data.guide.id} 
                onBeachesChange={setBeaches}
                propertyLatitude={data.property?.latitude ?? data.guide.latitude ?? null}
                propertyLongitude={data.property?.longitude ?? data.guide.longitude ?? null}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                  <p className="text-gray-600">No se puede gestionar playas sin una guía creada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="restaurants">
            {data?.guide?.id ? (
              <RestaurantsEditForm 
                restaurants={restaurants} 
                guideId={data.guide.id} 
                onRestaurantsChange={setRestaurants}
                propertyLatitude={data.property?.latitude ?? data.guide.latitude ?? null}
                propertyLongitude={data.property?.longitude ?? data.guide.longitude ?? null}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                  <p className="text-gray-600">No se puede gestionar restaurantes sin una guía creada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="shopping">
            {data?.guide?.id ? (
              <ShoppingEditForm 
                shopping={shopping} 
                guideId={data.guide.id} 
                onShoppingChange={setShopping}
                propertyLatitude={data.property?.latitude ?? data.guide.latitude ?? null}
                propertyLongitude={data.property?.longitude ?? data.guide.longitude ?? null}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                  <p className="text-gray-600">No se puede gestionar compras sin una guía creada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activities">
            {data?.guide?.id ? (
              <ActivitiesEditForm 
                activities={activities} 
                guideId={data.guide.id} 
                onActivitiesChange={setActivities}
                propertyLatitude={data.property?.latitude ?? data.guide.latitude ?? null}
                propertyLongitude={data.property?.longitude ?? data.guide.longitude ?? null}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                  <p className="text-gray-600">No se puede gestionar actividades sin una guía creada</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}