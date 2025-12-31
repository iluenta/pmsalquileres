"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Restaurant } from "@/types/guides"
import { createRestaurant, updateRestaurant, deleteRestaurant } from "@/lib/api/guides-client"
import { getRestaurantFromGoogleUrl } from "@/lib/api/google-places"
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
import { Loader2, AlertCircle, Search } from "lucide-react"

interface RestaurantsEditFormProps {
  restaurants: Restaurant[]
  guideId: string
  onRestaurantsChange: (restaurants: Restaurant[]) => void
  propertyLatitude?: number | null
  propertyLongitude?: number | null
}

export function RestaurantsEditForm({ restaurants, guideId, onRestaurantsChange, propertyLatitude, propertyLongitude }: RestaurantsEditFormProps) {
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleUrl, setGoogleUrl] = useState("")
  const [googleRestaurantData, setGoogleRestaurantData] = useState<Partial<Restaurant> | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setIsAddingNew(false)
    setGoogleUrl(restaurant.url || "") // Cargar URL existente si está disponible
    setGoogleRestaurantData(null) // Limpiar datos de Google al editar
    setGoogleError(null)
  }

  const handleAddNew = () => {
    setEditingRestaurant({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      name: "",
      description: "",
      address: "",
      cuisine_type: "",
      distance: null,
      walking_time: null,
      driving_time: null,
      rating: 0,
      review_count: 0,
      price_range: "",
      badge: "",
      image_url: "",
      url: "",
      phone: "",
      website: "",
      opening_hours: null,
      order_index: restaurants.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
    setGoogleUrl("")
    setGoogleRestaurantData(null)
    setGoogleError(null)
  }

  const handleSave = async () => {
    if (!editingRestaurant) return

    try {
      setLoading(true)

      if (isAddingNew) {
        // Crear nuevo restaurante
        const newRestaurant = await createRestaurant({
          guide_id: guideId,
          name: editingRestaurant.name,
          description: editingRestaurant.description,
          address: editingRestaurant.address,
          rating: editingRestaurant.rating,
          review_count: editingRestaurant.review_count,
          price_range: editingRestaurant.price_range,
          walking_time: editingRestaurant.walking_time,
          driving_time: editingRestaurant.driving_time,
          badge: editingRestaurant.badge,
          image_url: editingRestaurant.image_url,
          url: editingRestaurant.url,
          phone: editingRestaurant.phone,
          website: editingRestaurant.website,
          opening_hours: editingRestaurant.opening_hours,
          order_index: editingRestaurant.order_index
        })

        if (newRestaurant) {
          onRestaurantsChange([...restaurants, newRestaurant])
          toast({
            title: "Restaurante guardado",
            description: "El restaurante ha sido creado correctamente.",
          })
        }
      } else {
        // Actualizar restaurante existente
        const updatedRestaurant = await updateRestaurant(editingRestaurant.id, {
          name: editingRestaurant.name,
          description: editingRestaurant.description,
          address: editingRestaurant.address,
          rating: editingRestaurant.rating,
          review_count: editingRestaurant.review_count,
          price_range: editingRestaurant.price_range,
          walking_time: editingRestaurant.walking_time,
          driving_time: editingRestaurant.driving_time,
          badge: editingRestaurant.badge,
          image_url: editingRestaurant.image_url,
          url: editingRestaurant.url,
          phone: editingRestaurant.phone,
          website: editingRestaurant.website,
          opening_hours: editingRestaurant.opening_hours,
          order_index: editingRestaurant.order_index
        })

        if (updatedRestaurant) {
          onRestaurantsChange(restaurants.map(restaurant => restaurant.id === editingRestaurant.id ? updatedRestaurant : restaurant))
          toast({
            title: "Restaurante actualizado",
            description: "La información ha sido actualizada correctamente.",
          })
        }
      }

      setEditingRestaurant(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving restaurant:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (restaurantId: string) => {
    try {
      setLoading(true)
      const success = await deleteRestaurant(restaurantId)
      if (success) {
        onRestaurantsChange(restaurants.filter(restaurant => restaurant.id !== restaurantId))
        toast({
          title: "Restaurante eliminado",
          description: "El restaurante ha sido eliminado correctamente.",
        })
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el restaurante.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingRestaurant(null)
    setIsAddingNew(false)
    setGoogleUrl("")
    setGoogleRestaurantData(null)
    setGoogleError(null)
  }

  const handleFetchFromGoogle = async () => {
    if (!googleUrl.trim()) {
      setGoogleError("Por favor, ingresa una URL de Google Maps.")
      return
    }

    // Validar que sea una URL de Google Maps o Google Search
    const isGoogleMapsUrl = googleUrl.includes("google.com/maps") || googleUrl.includes("maps.google.com")
    const isGoogleSearchUrl = googleUrl.includes("google.com/search") || googleUrl.includes("google.es/search")
    const isGoogleShortUrl = googleUrl.includes("maps.app.goo.gl")

    if (!isGoogleMapsUrl && !isGoogleSearchUrl && !isGoogleShortUrl) {
      setGoogleError("Por favor, ingresa una URL válida de Google Maps.")
      return
    }

    try {
      setGoogleLoading(true)
      setGoogleError(null)
      setGoogleRestaurantData(null)

      const restaurantData = await getRestaurantFromGoogleUrl(googleUrl, propertyLatitude || undefined, propertyLongitude || undefined)

      if (restaurantData) {
        setGoogleRestaurantData(restaurantData)
      } else {
        setGoogleError("No se pudo encontrar información del restaurante en Google. Intenta con otra URL o completa el formulario manualmente.")
      }
    } catch (error) {
      console.error("Error fetching from Google:", error)
      setGoogleError("Error al buscar en Google. Por favor, intenta de nuevo o completa el formulario manualmente.")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleUseGoogleData = () => {
    if (!googleRestaurantData) return

    // Copiar datos de Google al formulario editable, preservando el ID y otros campos si se está editando
    setEditingRestaurant((prev) => ({
      ...prev!,
      name: googleRestaurantData.name || prev?.name || "",
      description: googleRestaurantData.description || prev?.description || "",
      address: googleRestaurantData.address || prev?.address || "",
      cuisine_type: googleRestaurantData.cuisine_type || prev?.cuisine_type || "",
      rating: googleRestaurantData.rating || prev?.rating || 0,
      review_count: googleRestaurantData.review_count || prev?.review_count || 0,
      walking_time: googleRestaurantData.walking_time ?? prev?.walking_time ?? null,
      driving_time: googleRestaurantData.driving_time ?? prev?.driving_time ?? null,
      price_range: googleRestaurantData.price_range || prev?.price_range || "",
      badge: googleRestaurantData.badge || prev?.badge || "",
      image_url: googleRestaurantData.image_url || prev?.image_url || "",
      url: googleRestaurantData.url || googleUrl || prev?.url || "",
      phone: googleRestaurantData.phone || prev?.phone || "",
      website: googleRestaurantData.website || prev?.website || "",
      opening_hours: googleRestaurantData.opening_hours || prev?.opening_hours || null,
    }))

    // Limpiar datos de Google para mostrar el formulario
    setGoogleRestaurantData(null)
    setGoogleUrl("")
  }

  const handleEditManually = () => {
    // Limpiar datos de Google y mostrar formulario vacío
    setGoogleRestaurantData(null)
    setGoogleUrl("")
    setGoogleError(null)
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-utensils text-orange-600"></i>
              Restaurantes ({restaurants.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading} className="w-full md:w-auto">
              <i className="fas fa-plus mr-2"></i>
              Agregar Restaurante
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {restaurants.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-utensils text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No hay restaurantes agregados</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">Agrega los restaurantes que recomiendas a tus huéspedes</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {restaurants.map((restaurant) => (
                <Card key={restaurant.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-utensils text-orange-600"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <CardTitle className="text-lg truncate">{restaurant.name}</CardTitle>
                            {restaurant.badge && (
                              <Badge variant="secondary" className="flex-shrink-0">{restaurant.badge}</Badge>
                            )}
                          </div>
                          {restaurant.description && (
                            <p className="text-sm text-gray-600 mb-2 break-words">{restaurant.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {restaurant.rating && restaurant.rating > 0 && (
                              <div className="flex items-center gap-1">
                                {renderStars(restaurant.rating)}
                                <span className="ml-1">({restaurant.rating})</span>
                              </div>
                            )}
                            {restaurant.review_count && restaurant.review_count > 0 && (
                              <span>({restaurant.review_count} reseñas)</span>
                            )}
                            {restaurant.price_range && (
                              <span className="font-medium">{restaurant.price_range}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(restaurant)}
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
                                Esta acción eliminará de forma permanente el restaurante "{restaurant.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(restaurant.id)}
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
                  {restaurant.image_url && (
                    <CardContent className="pt-0">
                      <img
                        src={restaurant.image_url}
                        alt={restaurant.name}
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
      {editingRestaurant && (
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Agregar Nuevo Restaurante' : 'Editar Restaurante'}
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
                    placeholder="Pega aquí la URL de búsqueda de Google del restaurante"
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
                    ? "Pega la URL completa de una búsqueda de Google del restaurante para obtener automáticamente su información"
                    : "Actualiza la información del restaurante pegando una nueva URL de búsqueda de Google"}
                </p>
                {googleError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{googleError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Mostrar información de Google si está disponible */}
              {googleRestaurantData && (
                <GoogleRestaurantInfo
                  restaurantData={googleRestaurantData}
                  onUseData={handleUseGoogleData}
                  onEditManually={handleEditManually}
                  loading={googleLoading}
                />
              )}

              {/* Formulario manual (solo si no hay datos de Google disponibles) */}
              {!googleRestaurantData && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Nombre</Label>
                    <Input
                      id="restaurant-name"
                      value={editingRestaurant.name || ''}
                      onChange={(e) => setEditingRestaurant({ ...editingRestaurant, name: e.target.value })}
                      placeholder="Nombre del restaurante"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-description">Descripción</Label>
                    <Textarea
                      id="restaurant-description"
                      value={editingRestaurant.description || ''}
                      onChange={(e) => setEditingRestaurant({ ...editingRestaurant, description: e.target.value })}
                      placeholder="Descripción del restaurante"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-address">Dirección</Label>
                    <Input
                      id="restaurant-address"
                      value={editingRestaurant.address || ''}
                      onChange={(e) => setEditingRestaurant({ ...editingRestaurant, address: e.target.value })}
                      placeholder="Dirección del restaurante"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-rating">Calificación (1-5)</Label>
                      <Input
                        id="restaurant-rating"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={editingRestaurant.rating || ''}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, rating: e.target.value ? Number.parseFloat(e.target.value) : 0 })}
                        placeholder="4.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-reviews">Número de Reseñas</Label>
                      <Input
                        id="restaurant-reviews"
                        type="number"
                        min="0"
                        value={editingRestaurant.review_count || ''}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, review_count: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                        placeholder="150"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-price">Rango de Precio</Label>
                      <Input
                        id="restaurant-price"
                        value={editingRestaurant.price_range || ''}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, price_range: e.target.value })}
                        placeholder="€20-€40"
                      />
                      <p className="text-xs text-gray-500">
                        Se establece automáticamente desde Google (€10-€20, €20-€40, €40-€80, €80+). Puedes editarlo manualmente.
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-walking-time">Tiempo caminando (minutos)</Label>
                      <Input
                        id="restaurant-walking-time"
                        type="number"
                        min="0"
                        value={editingRestaurant.walking_time || ''}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, walking_time: e.target.value ? Number.parseInt(e.target.value) : null })}
                        placeholder="Ej: 15"
                      />
                      <p className="text-xs text-gray-500">
                        Tiempo en minutos caminando desde la propiedad
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-driving-time">Tiempo en coche (minutos)</Label>
                      <Input
                        id="restaurant-driving-time"
                        type="number"
                        min="0"
                        value={editingRestaurant.driving_time || ''}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, driving_time: e.target.value ? Number.parseInt(e.target.value) : null })}
                        placeholder="Ej: 3"
                      />
                      <p className="text-xs text-gray-500">
                        Tiempo en minutos en coche desde la propiedad
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-badge">Badge</Label>
                      <Input
                        id="restaurant-badge"
                        value={editingRestaurant.badge || ''}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, badge: e.target.value })}
                        placeholder="Ej: Recomendado"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-order">Orden</Label>
                      <Input
                        id="restaurant-order"
                        type="number"
                        value={editingRestaurant.order_index || ''}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-image">URL de Imagen</Label>
                    <Input
                      id="restaurant-image"
                      value={editingRestaurant.image_url || ''}
                      onChange={(e) => setEditingRestaurant({ ...editingRestaurant, image_url: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-url">URL del Restaurante / Sitio Web</Label>
                    <Input
                      id="restaurant-url"
                      value={editingRestaurant.url || ''}
                      onChange={(e) => setEditingRestaurant({ ...editingRestaurant, url: e.target.value })}
                      placeholder="https://maps.google.com/... o https://restaurante.com"
                    />
                    <p className="text-xs text-gray-500">URL de Google Maps o sitio web del restaurante</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-phone">Teléfono</Label>
                      <Input
                        id="restaurant-phone"
                        value={editingRestaurant.phone || ''}
                        onChange={(e) => setEditingRestaurant({ ...editingRestaurant, phone: e.target.value })}
                        placeholder="Ej: +34 912 345 678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurant-opening-hours">Horarios (una línea por día)</Label>
                    <Textarea
                      id="restaurant-opening-hours"
                      value={editingRestaurant.opening_hours?.weekday_text?.join('\n') || ''}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(line => line.trim() !== '')
                        setEditingRestaurant({
                          ...editingRestaurant,
                          opening_hours: {
                            ...editingRestaurant.opening_hours,
                            weekday_text: lines,
                            open_now: editingRestaurant.opening_hours?.open_now ?? false
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
