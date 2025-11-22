"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ApartmentSection } from "@/types/guides"
import { getApartmentSections, createApartmentSection, updateApartmentSection, deleteApartmentSection } from "@/lib/api/guides-client"

interface ApartmentSectionsManagerProps {
  guideId: string
  apartmentSections?: ApartmentSection[]
  onDataChange?: () => void
}

export function ApartmentSectionsManager({ guideId, apartmentSections = [], onDataChange }: ApartmentSectionsManagerProps) {
  const [sections, setSections] = useState<ApartmentSection[]>(apartmentSections)
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<ApartmentSection | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newAmenity, setNewAmenity] = useState("")

  // Amenities predefinidos por tipo de sección
  const predefinedAmenities = {
    cocina: [
      "Vitrocerámica", "Horno", "Microondas", "Nevera", "Lavavajillas", 
      "Cafetera", "Tostadora", "Utensilios de cocina", "Vajilla completa", 
      "Cristalería", "Mesa de comedor", "Sillas", "Fregadero", "Encimera"
    ],
    bano: [
      "Ducha", "Bañera", "Toallas", "Secador de pelo", "Artículos de aseo básicos",
      "Espejo", "Armario", "Calefactor", "Ventilador", "Grifos modernos"
    ],
    salon: [
      "Sofá", "TV de pantalla plana", "Aire acondicionado", "Mesa de centro",
      "Lámparas", "Alfombra", "Biblioteca", "Chimenea", "Ventilador de techo"
    ],
    dormitorio: [
      "Cama doble", "Armario", "Mesitas de noche", "Lámparas", "Ventilador",
      "Aire acondicionado", "Espejo", "Alfombra", "Persianas", "Cortinas"
    ],
    terraza: [
      "Mesa exterior", "Sillas", "Sombrilla", "Barbacoa", "Lavabo exterior",
      "Iluminación", "Macetas", "Hamaca", "Mesa de ping pong", "Piscina"
    ],
    entrada: [
      "Perchero", "Espejo", "Banco", "Armario", "Lámpara", "Alfombra de entrada",
      "Caja de llaves", "Intercomunicador", "Timbre", "Cámara de seguridad"
    ],
    balcon: [
      "Mesa pequeña", "Sillas", "Macetas", "Iluminación", "Barandilla",
      "Sombrilla", "Hamaca", "Mesa de café", "Lámpara", "Alfombra"
    ],
    garaje: [
      "Plaza de aparcamiento", "Iluminación", "Puerta automática", "Caja de herramientas",
      "Bicicletas", "Motos", "Lavadora", "Secadora", "Armario", "Escalera"
    ]
  }

  // Cargar secciones al montar el componente
  useEffect(() => {
    loadSections()
  }, [guideId])

  const loadSections = async () => {
    try {
      setLoading(true)
      const sectionsData = await getApartmentSections(guideId)
      setSections(sectionsData || [])
    } catch (error) {
      console.error('Error loading apartment sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (section: ApartmentSection) => {
    setEditingSection(section)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingSection({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      section_type: "cocina",
      title: "",
      description: "",
      details: "",
      image_url: "",
      icon: "fas fa-home",
      order_index: sections.length + 1,
      amenities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingSection) return

    try {
      if (isAddingNew) {
        // Crear nueva sección
        const newSection = await createApartmentSection({
          guide_id: guideId,
          section_type: editingSection.section_type,
          title: editingSection.title,
          description: editingSection.description,
          details: editingSection.details,
          content: editingSection.description, // Usar description como content
          image_url: editingSection.image_url,
          icon: editingSection.icon,
          order_index: editingSection.order_index,
          amenities: editingSection.amenities
        })
        
        if (newSection) {
          setSections([...sections, newSection])
          onDataChange?.()
        }
      } else {
        // Actualizar sección existente
        const updatedSection = await updateApartmentSection(editingSection.id, {
          section_type: editingSection.section_type,
          title: editingSection.title,
          description: editingSection.description,
          details: editingSection.details,
          content: editingSection.description, // Usar description como content
          image_url: editingSection.image_url,
          icon: editingSection.icon,
          order_index: editingSection.order_index,
          amenities: editingSection.amenities
        })
        
        if (updatedSection) {
          setSections(sections.map(section => section.id === editingSection.id ? updatedSection : section))
          onDataChange?.()
        }
      }
      
      setEditingSection(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving apartment section:', error)
    }
  }

  const handleDelete = async (sectionId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta sección?")) {
      try {
        const success = await deleteApartmentSection(sectionId)
        if (success) {
          setSections(sections.filter(section => section.id !== sectionId))
          onDataChange?.()
        }
      } catch (error) {
        console.error('Error deleting apartment section:', error)
      }
    }
  }

  const handleCancel = () => {
    setEditingSection(null)
    setIsAddingNew(false)
  }

  // Funciones para manejar amenities
  const addAmenity = (amenity: string) => {
    if (!editingSection || !amenity.trim()) return
    
    const currentAmenities = editingSection.amenities || []
    if (!currentAmenities.includes(amenity.trim())) {
      setEditingSection({
        ...editingSection,
        amenities: [...currentAmenities, amenity.trim()]
      })
    }
  }

  const removeAmenity = (amenity: string) => {
    if (!editingSection) return
    
    setEditingSection({
      ...editingSection,
      amenities: (editingSection.amenities || []).filter(a => a !== amenity)
    })
  }

  const addCustomAmenity = () => {
    if (newAmenity.trim()) {
      addAmenity(newAmenity.trim())
      setNewAmenity("")
    }
  }

  const sectionTypeLabels = {
    cocina: "Cocina",
    bano: "Baño",
    salon: "Salón",
    dormitorio: "Dormitorio",
    terraza: "Terraza",
    entrada: "Entrada",
    balcon: "Balcón",
    garaje: "Garaje"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">Cargando secciones del apartamento...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-home text-blue-600"></i>
              Secciones del Apartamento ({sections.length})
            </CardTitle>
            <Button onClick={handleAddNew} className="w-full md:w-auto">
              <i className="fas fa-plus mr-2"></i>
              Agregar Sección
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-home text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No hay secciones del apartamento creadas</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">Agrega secciones para describir las diferentes áreas de la propiedad</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sections.map((section) => (
                <Card key={section.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {section.icon && (
                          <i className={`${section.icon} text-blue-600 text-lg flex-shrink-0`}></i>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{section.title}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {sectionTypeLabels[section.section_type as keyof typeof sectionTypeLabels] || section.section_type}
                          </p>
                          {section.description && (
                            <p className="text-sm text-gray-600 mt-1 break-words">{section.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(section)}
                          className="text-blue-600 hover:text-blue-700 flex-1 md:flex-initial"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(section.id)}
                          className="text-red-600 hover:text-red-700 flex-shrink-0"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {section.details && (
                      <p className="text-sm text-gray-700 mb-3">{section.details}</p>
                    )}
                    {section.amenities && section.amenities.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {section.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de edición */}
      {editingSection && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Agregar Nueva Sección' : 'Editar Sección'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="section-type">Tipo de Sección</Label>
                  <Select
                    value={editingSection.section_type || ''}
                    onValueChange={(value) => setEditingSection({ ...editingSection, section_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sectionTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section-icon">Icono (Font Awesome)</Label>
                  <Input
                    id="section-icon"
                    value={editingSection.icon || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, icon: e.target.value })}
                    placeholder="fas fa-home"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-title">Título</Label>
                <Input
                  id="section-title"
                  value={editingSection.title || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  placeholder="Título de la sección"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-description">Descripción</Label>
                <Textarea
                  id="section-description"
                  value={editingSection.description || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  placeholder="Descripción breve de la sección"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-details">Detalles</Label>
                <Textarea
                  id="section-details"
                  value={editingSection.details || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, details: e.target.value })}
                  placeholder="Información detallada sobre esta sección"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-image">URL de Imagen</Label>
                <Input
                  id="section-image"
                  value={editingSection.image_url || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, image_url: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section-order">Orden</Label>
                <Input
                  id="section-order"
                  type="number"
                  value={editingSection.order_index || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                />
              </div>

              {/* Sección de Amenities */}
              <div className="space-y-4">
                <Label>Amenities</Label>
                
                {/* Amenities actuales */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amenities seleccionados:</Label>
                  <div className="flex flex-wrap gap-2">
                    {(editingSection.amenities || []).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </Badge>
                    ))}
                    {(!editingSection.amenities || editingSection.amenities.length === 0) && (
                      <p className="text-sm text-gray-500">No hay amenities seleccionados</p>
                    )}
                  </div>
                </div>

                {/* Amenities predefinidos */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Amenities predefinidos:</Label>
                  <div className="flex flex-wrap gap-2">
                    {(predefinedAmenities[editingSection.section_type as keyof typeof predefinedAmenities] || []).map((amenity) => (
                      <Button
                        key={amenity}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addAmenity(amenity)}
                        disabled={(editingSection.amenities || []).includes(amenity)}
                        className="text-xs"
                      >
                        <i className="fas fa-plus mr-1"></i>
                        {amenity}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Agregar amenity personalizado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Agregar amenity personalizado:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      placeholder="Escribe un amenity personalizado"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()}
                    />
                    <Button type="button" onClick={addCustomAmenity} disabled={!newAmenity.trim()}>
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <i className="fas fa-save mr-2"></i>
                  Guardar
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
