"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Beach } from "@/types/guides"
import { createBeach, updateBeach, deleteBeach } from "@/lib/api/guides-client"

interface BeachesEditFormProps {
  beaches: Beach[]
  guideId: string
  onBeachesChange: (beaches: Beach[]) => void
}

export function BeachesEditForm({ beaches, guideId, onBeachesChange }: BeachesEditFormProps) {
  const [editingBeach, setEditingBeach] = useState<Beach | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = (beach: Beach) => {
    setEditingBeach(beach)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingBeach({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      name: "",
      description: "",
      distance: "",
      rating: 0,
      badge: "",
      image_url: "",
      order_index: beaches.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingBeach) return

    try {
      setLoading(true)
      
      if (isAddingNew) {
        // Crear nueva playa
        const newBeach = await createBeach({
          guide_id: guideId,
          name: editingBeach.name,
          description: editingBeach.description,
          distance: editingBeach.distance,
          rating: editingBeach.rating,
          badge: editingBeach.badge,
          image_url: editingBeach.image_url,
          order_index: editingBeach.order_index
        })
        
        if (newBeach) {
          onBeachesChange([...beaches, newBeach])
        }
      } else {
        // Actualizar playa existente
        const updatedBeach = await updateBeach(editingBeach.id, {
          name: editingBeach.name,
          description: editingBeach.description,
          distance: editingBeach.distance,
          rating: editingBeach.rating,
          badge: editingBeach.badge,
          image_url: editingBeach.image_url,
          order_index: editingBeach.order_index
        })
        
        if (updatedBeach) {
          onBeachesChange(beaches.map(beach => beach.id === editingBeach.id ? updatedBeach : beach))
        }
      }
      
      setEditingBeach(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving beach:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (beachId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta playa?")) {
      try {
        setLoading(true)
        const success = await deleteBeach(beachId)
        if (success) {
          onBeachesChange(beaches.filter(beach => beach.id !== beachId))
        }
      } catch (error) {
        console.error('Error deleting beach:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCancel = () => {
    setEditingBeach(null)
    setIsAddingNew(false)
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fas fa-star ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      )
    }
    return <div className="flex gap-1">{stars}</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-umbrella-beach text-blue-600"></i>
              Playas ({beaches.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Playa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {beaches.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-umbrella-beach text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No hay playas agregadas</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">Agrega las playas cercanas que recomiendas a tus huéspedes</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {beaches.map((beach) => (
                <Card key={beach.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-umbrella-beach text-blue-600"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{beach.name}</CardTitle>
                            {beach.badge && (
                              <Badge variant="secondary">{beach.badge}</Badge>
                            )}
                          </div>
                          {beach.description && (
                            <p className="text-sm text-gray-600 mb-2">{beach.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {beach.distance && (
                              <span className="flex items-center gap-1">
                                <i className="fas fa-map-marker-alt"></i>
                                {beach.distance}
                              </span>
                            )}
                            {beach.rating && beach.rating > 0 && (
                              <div className="flex items-center gap-1">
                                {renderStars(beach.rating)}
                                <span className="ml-1">({beach.rating})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(beach)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(beach.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {beach.image_url && (
                    <CardContent className="pt-0">
                      <img 
                        src={beach.image_url} 
                        alt={beach.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de edición */}
      {editingBeach && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Agregar Nueva Playa' : 'Editar Playa'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beach-name">Nombre</Label>
                  <Input
                    id="beach-name"
                    value={editingBeach.name || ''}
                    onChange={(e) => setEditingBeach({ ...editingBeach, name: e.target.value })}
                    placeholder="Nombre de la playa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beach-distance">Distancia</Label>
                  <Input
                    id="beach-distance"
                    value={editingBeach.distance || ''}
                    onChange={(e) => setEditingBeach({ ...editingBeach, distance: e.target.value })}
                    placeholder="Ej: 5 minutos en coche"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beach-rating">Calificación (1-5)</Label>
                  <Input
                    id="beach-rating"
                    type="number"
                    min="1"
                    max="5"
                    value={editingBeach.rating || ''}
                    onChange={(e) => setEditingBeach({ ...editingBeach, rating: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beach-badge">Badge</Label>
                  <Input
                    id="beach-badge"
                    value={editingBeach.badge || ''}
                    onChange={(e) => setEditingBeach({ ...editingBeach, badge: e.target.value })}
                    placeholder="Ej: Recomendada"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beach-description">Descripción</Label>
                <Textarea
                  id="beach-description"
                  value={editingBeach.description || ''}
                  onChange={(e) => setEditingBeach({ ...editingBeach, description: e.target.value })}
                  placeholder="Descripción de la playa"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beach-image">URL de Imagen</Label>
                <Input
                  id="beach-image"
                  value={editingBeach.image_url || ''}
                  onChange={(e) => setEditingBeach({ ...editingBeach, image_url: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beach-order">Orden</Label>
                <Input
                  id="beach-order"
                  type="number"
                  value={editingBeach.order_index || ''}
                  onChange={(e) => setEditingBeach({ ...editingBeach, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <i className="fas fa-save mr-2"></i>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
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
