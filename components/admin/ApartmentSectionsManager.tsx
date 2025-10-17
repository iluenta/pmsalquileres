"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
          image_url: editingSection.image_url,
          icon: editingSection.icon,
          order_index: editingSection.order_index
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
          image_url: editingSection.image_url,
          icon: editingSection.icon,
          order_index: editingSection.order_index
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-home text-blue-600"></i>
              Secciones del Apartamento ({sections.length})
            </CardTitle>
            <Button onClick={handleAddNew}>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {section.icon && (
                          <i className={`${section.icon} text-blue-600 text-lg`}></i>
                        )}
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {sectionTypeLabels[section.section_type] || section.section_type}
                          </p>
                          {section.description && (
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(section)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(section.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {section.details && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-700">{section.details}</p>
                    </CardContent>
                  )}
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
