"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Activity } from "@/types/guides"
import { createActivity, updateActivity, deleteActivity } from "@/lib/api/guides-client"

interface ActivitiesEditFormProps {
  activities: Activity[]
  guideId: string
  onActivitiesChange: (activities: Activity[]) => void
}

export function ActivitiesEditForm({ activities, guideId, onActivitiesChange }: ActivitiesEditFormProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingActivity({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      name: "",
      description: "",
      activity_type: "",
      duration: "",
      distance: null,
      price_info: "",
      badge: "",
      image_url: "",
      order_index: activities.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingActivity) return

    try {
      setLoading(true)
      
      if (isAddingNew) {
        // Crear nueva actividad
        const newActivity = await createActivity({
          guide_id: guideId,
          name: editingActivity.name,
          description: editingActivity.description,
          distance: editingActivity.distance,
          price_info: editingActivity.price_info,
          badge: editingActivity.badge,
          image_url: editingActivity.image_url,
          order_index: editingActivity.order_index
        })
        
        if (newActivity) {
          onActivitiesChange([...activities, newActivity])
        }
      } else {
        // Actualizar actividad existente
        const updatedActivity = await updateActivity(editingActivity.id, {
          name: editingActivity.name,
          description: editingActivity.description,
          distance: editingActivity.distance,
          price_info: editingActivity.price_info,
          badge: editingActivity.badge,
          image_url: editingActivity.image_url,
          order_index: editingActivity.order_index
        })
        
        if (updatedActivity) {
          onActivitiesChange(activities.map(activity => activity.id === editingActivity.id ? updatedActivity : activity))
        }
      }
      
      setEditingActivity(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (activityId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta actividad?")) {
      try {
        setLoading(true)
        const success = await deleteActivity(activityId)
        if (success) {
          onActivitiesChange(activities.filter(activity => activity.id !== activityId))
        }
      } catch (error) {
        console.error('Error deleting activity:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCancel = () => {
    setEditingActivity(null)
    setIsAddingNew(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-hiking text-purple-600"></i>
              Actividades ({activities.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Actividad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-hiking text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No hay actividades agregadas</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">Agrega las actividades que recomiendas a tus huéspedes</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-hiking text-purple-600"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{activity.name}</CardTitle>
                            {activity.badge && (
                              <Badge variant="secondary">{activity.badge}</Badge>
                            )}
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {activity.distance && (
                              <span className="flex items-center gap-1">
                                <i className="fas fa-map-marker-alt"></i>
                                {activity.distance}
                              </span>
                            )}
                            {activity.price_info && (
                              <span className="flex items-center gap-1">
                                <i className="fas fa-euro-sign"></i>
                                {activity.price_info}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(activity.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {activity.image_url && (
                    <CardContent className="pt-0">
                      <img 
                        src={activity.image_url} 
                        alt={activity.name}
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
      {editingActivity && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Agregar Nueva Actividad' : 'Editar Actividad'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activity-name">Nombre</Label>
                <Input
                  id="activity-name"
                  value={editingActivity.name || ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
                  placeholder="Nombre de la actividad"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity-description">Descripción</Label>
                <Textarea
                  id="activity-description"
                  value={editingActivity.description || ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  placeholder="Descripción de la actividad"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-distance">Distancia</Label>
                  <Input
                    id="activity-distance"
                    value={editingActivity.distance || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, distance: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Ej: 10 minutos en coche"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-price">Información de Precio</Label>
                  <Input
                    id="activity-price"
                    value={editingActivity.price_info || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, price_info: e.target.value })}
                    placeholder="Ej: Desde 15€ por persona"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-badge">Badge</Label>
                  <Input
                    id="activity-badge"
                    value={editingActivity.badge || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, badge: e.target.value })}
                    placeholder="Ej: Recomendada"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-order">Orden</Label>
                  <Input
                    id="activity-order"
                    type="number"
                    value={editingActivity.order_index || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity-image">URL de Imagen</Label>
                <Input
                  id="activity-image"
                  value={editingActivity.image_url || ''}
                  onChange={(e) => setEditingActivity({ ...editingActivity, image_url: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
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
