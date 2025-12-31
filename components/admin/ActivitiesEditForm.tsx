"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity } from "@/types/guides"
import { createActivity, updateActivity, deleteActivity } from "@/lib/api/guides-client"
import { getActivityFromGoogleUrl } from "@/lib/api/google-places"
import { GoogleRestaurantInfo } from "./GoogleRestaurantInfo"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Search, AlertCircle } from "lucide-react"

interface ActivitiesEditFormProps {
  activities: Activity[]
  guideId: string
  onActivitiesChange: (activities: Activity[]) => void
  propertyLatitude?: number | null
  propertyLongitude?: number | null
}

export function ActivitiesEditForm({ activities, guideId, onActivitiesChange, propertyLatitude, propertyLongitude }: ActivitiesEditFormProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleUrl, setGoogleUrl] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleActivityData, setGoogleActivityData] = useState<Partial<Activity> | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setIsAddingNew(false)
    setGoogleUrl(activity.url || "")
    setGoogleActivityData(null)
    setGoogleError(null)
  }

  const handleAddNew = () => {
    setEditingActivity({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      name: "",
      description: "",
      address: "",
      activity_type: "",
      duration: "",
      distance: null,
      walking_time: null,
      driving_time: null,
      price_info: "",
      price_range: "",
      rating: null,
      review_count: null,
      badge: "",
      image_url: "",
      url: "",
      phone: "",
      website: "",
      opening_hours: null,
      order_index: activities.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
    setGoogleUrl("")
    setGoogleActivityData(null)
    setGoogleError(null)
  }

  const handleFetchFromGoogle = async () => {
    if (!googleUrl.trim()) {
      setGoogleError("Por favor, ingresa una URL de Google Maps.")
      return
    }

    setGoogleLoading(true)
    setGoogleError(null)
    setGoogleActivityData(null)

    try {
      const data = await getActivityFromGoogleUrl(googleUrl, propertyLatitude || undefined, propertyLongitude || undefined)
      if (data) {
        setGoogleActivityData(data)
      } else {
        setGoogleError("No se pudo obtener información de Google para esa URL. Por favor, verifica que la URL sea válida.")
      }
    } catch (error: any) {
      console.error("[ActivitiesEditForm] Error fetching from Google:", error)
      setGoogleError(error.message || "Error al buscar en Google. Por favor, verifica que la URL sea válida.")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleUseGoogleData = () => {
    if (!googleActivityData) return

    setEditingActivity((prev) => ({
      ...prev!,
      name: googleActivityData.name || prev?.name || "",
      description: googleActivityData.description || prev?.description || "",
      address: googleActivityData.address || prev?.address || "",
      activity_type: googleActivityData.activity_type || prev?.activity_type || "",
      rating: googleActivityData.rating || prev?.rating || null,
      review_count: googleActivityData.review_count || prev?.review_count || null,
      walking_time: googleActivityData.walking_time ?? prev?.walking_time ?? null,
      driving_time: googleActivityData.driving_time ?? prev?.driving_time ?? null,
      price_range: googleActivityData.price_range || prev?.price_range || "",
      badge: googleActivityData.badge || prev?.badge || "",
      image_url: googleActivityData.image_url || prev?.image_url || "",
      url: googleActivityData.url || googleUrl || prev?.url || "",
      phone: googleActivityData.phone || prev?.phone || "",
      website: googleActivityData.website || prev?.website || "",
      opening_hours: googleActivityData.opening_hours || prev?.opening_hours || null,
    }))

    setGoogleActivityData(null)
    setGoogleUrl("")
  }

  const handleEditManually = () => {
    setGoogleActivityData(null)
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
          address: editingActivity.address,
          activity_type: editingActivity.activity_type,
          duration: editingActivity.duration,
          distance: editingActivity.distance,
          walking_time: editingActivity.walking_time,
          driving_time: editingActivity.driving_time,
          price_info: editingActivity.price_info,
          price_range: editingActivity.price_range,
          rating: editingActivity.rating,
          review_count: editingActivity.review_count,
          badge: editingActivity.badge,
          image_url: editingActivity.image_url,
          url: editingActivity.url,
          phone: editingActivity.phone,
          website: editingActivity.website,
          opening_hours: editingActivity.opening_hours,
          order_index: editingActivity.order_index
        })

        if (newActivity) {
          onActivitiesChange([...activities, newActivity])
          toast({
            title: "Actividad guardada",
            description: "La actividad ha sido creada correctamente.",
          })
        }
      } else {
        // Actualizar actividad existente
        const updatedActivity = await updateActivity(editingActivity.id, {
          name: editingActivity.name,
          description: editingActivity.description,
          address: editingActivity.address,
          activity_type: editingActivity.activity_type,
          duration: editingActivity.duration,
          distance: editingActivity.distance,
          walking_time: editingActivity.walking_time,
          driving_time: editingActivity.driving_time,
          price_info: editingActivity.price_info,
          price_range: editingActivity.price_range,
          rating: editingActivity.rating,
          review_count: editingActivity.review_count,
          badge: editingActivity.badge,
          image_url: editingActivity.image_url,
          url: editingActivity.url,
          phone: editingActivity.phone,
          website: editingActivity.website,
          opening_hours: editingActivity.opening_hours,
          order_index: editingActivity.order_index
        })

        if (updatedActivity) {
          onActivitiesChange(activities.map(activity => activity.id === editingActivity.id ? updatedActivity : activity))
          toast({
            title: "Actividad actualizada",
            description: "La información ha sido actualizada correctamente.",
          })
        }
      }

      setEditingActivity(null)
      setIsAddingNew(false)
      setGoogleUrl("")
      setGoogleActivityData(null)
      setGoogleError(null)
    } catch (error) {
      console.error('Error saving activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingActivity(null)
    setIsAddingNew(false)
    setGoogleUrl("")
    setGoogleActivityData(null)
    setGoogleError(null)
  }

  const handleDelete = async (activityId: string) => {
    try {
      setLoading(true)
      const success = await deleteActivity(activityId)
      if (success) {
        onActivitiesChange(activities.filter(activity => activity.id !== activityId))
        toast({
          title: "Actividad eliminada",
          description: "La actividad ha sido eliminada correctamente.",
        })
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-hiking text-purple-600"></i>
              Actividades ({activities.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading} className="w-full md:w-auto">
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
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-hiking text-purple-600"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <CardTitle className="text-lg truncate">{activity.name}</CardTitle>
                            {activity.badge && (
                              <Badge variant="secondary" className="flex-shrink-0">{activity.badge}</Badge>
                            )}
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mb-2 break-words">{activity.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-700 w-full sm:w-auto"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará de forma permanente la actividad "{activity.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(activity.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
              {/* Campo para URL de Google (disponible al agregar y editar) */}
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Label htmlFor="google-url" className="flex items-center gap-2">
                  <i className="fab fa-google text-blue-600"></i>
                  URL de Búsqueda de Google (Opcional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="google-url"
                    value={googleUrl}
                    onChange={(e) => {
                      setGoogleUrl(e.target.value)
                      setGoogleError(null)
                    }}
                    placeholder="Pega aquí la URL de búsqueda de Google de la actividad"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleFetchFromGoogle}
                    disabled={googleLoading || !googleUrl.trim()}
                    variant="outline"
                    className="flex-shrink-0"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar en Google
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  {isAddingNew
                    ? "Pega la URL completa de una búsqueda de Google de la actividad para obtener automáticamente su información"
                    : "Actualiza la información de la actividad pegando una nueva URL de búsqueda de Google"}
                </p>
                {googleError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{googleError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Mostrar información de Google si está disponible */}
              {googleActivityData && (
                <GoogleRestaurantInfo
                  restaurantData={googleActivityData as any}
                  onUseData={handleUseGoogleData}
                  onEditManually={handleEditManually}
                  loading={googleLoading}
                />
              )}

              {/* Teléfono */}
              {!googleActivityData && (
                <div className="space-y-2">
                  <Label htmlFor="activity-phone">Teléfono</Label>
                  <Input
                    id="activity-phone"
                    value={editingActivity.phone || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, phone: e.target.value })}
                    placeholder="Ej: +34 912 345 678"
                  />
                </div>
              )}

              {/* Formulario manual (solo si no hay datos de Google disponibles) */}
              {!googleActivityData && (
                <>
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
                      <Label htmlFor="activity-price">Información de Precio (Manual)</Label>
                      <Input
                        id="activity-price"
                        value={editingActivity.price_info || ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, price_info: e.target.value })}
                        placeholder="Ej: Desde 15€ por persona"
                      />
                      <p className="text-xs text-gray-500">Detalles específicos del precio</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activity-price-range">Rango de Precio (desde Google)</Label>
                      <Input
                        id="activity-price-range"
                        value={editingActivity.price_range || ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, price_range: e.target.value })}
                        placeholder="€20-€40"
                      />
                      <p className="text-xs text-gray-500">Estimación de Google</p>
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="activity-walking-time">Tiempo Caminando (minutos)</Label>
                      <Input
                        id="activity-walking-time"
                        type="number"
                        min="0"
                        value={editingActivity.walking_time || ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, walking_time: e.target.value ? Number.parseInt(e.target.value) : null })}
                        placeholder="Ej: 15"
                      />
                      <p className="text-xs text-gray-500">
                        Tiempo en minutos caminando desde la propiedad
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activity-driving-time">Tiempo en Coche (minutos)</Label>
                      <Input
                        id="activity-driving-time"
                        type="number"
                        min="0"
                        value={editingActivity.driving_time || ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, driving_time: e.target.value ? Number.parseInt(e.target.value) : null })}
                        placeholder="Ej: 3"
                      />
                      <p className="text-xs text-gray-500">
                        Tiempo en minutos en coche desde la propiedad
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-address">Dirección</Label>
                    <Input
                      id="activity-address"
                      value={editingActivity.address || ''}
                      onChange={(e) => setEditingActivity({ ...editingActivity, address: e.target.value })}
                      placeholder="Dirección de la actividad"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="activity-rating">Calificación (1-5)</Label>
                      <Input
                        id="activity-rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={editingActivity.rating !== null ? editingActivity.rating : ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, rating: e.target.value ? Number.parseFloat(e.target.value) : null })}
                        placeholder="4.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="activity-reviews">Número de Reseñas</Label>
                      <Input
                        id="activity-reviews"
                        type="number"
                        min="0"
                        value={editingActivity.review_count !== null ? editingActivity.review_count : ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, review_count: e.target.value ? Number.parseInt(e.target.value) : null })}
                        placeholder="150"
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

                  <div className="space-y-2">
                    <Label htmlFor="activity-url">URL del Lugar / Sitio Web</Label>
                    <Input
                      id="activity-url"
                      value={editingActivity.url || ''}
                      onChange={(e) => setEditingActivity({ ...editingActivity, url: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity-opening-hours">Horarios (una línea por día)</Label>
                    <Textarea
                      id="activity-opening-hours"
                      value={editingActivity.opening_hours?.weekday_text?.join('\n') || ''}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(line => line.trim() !== '')
                        setEditingActivity({
                          ...editingActivity,
                          opening_hours: {
                            ...editingActivity.opening_hours,
                            weekday_text: lines,
                            open_now: editingActivity.opening_hours?.open_now ?? false
                          }
                        })
                      }}
                      placeholder={"Lunes: 9:00–18:00\nMartes: 9:00–18:00\n..."}
                      rows={7}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                      <i className="fas fa-save mr-2"></i>
                      {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={loading} className="w-full sm:w-auto">
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
