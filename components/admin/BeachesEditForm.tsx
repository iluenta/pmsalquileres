"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Beach } from "@/types/guides"
import { createBeach, updateBeach, deleteBeach } from "@/lib/api/guides-client"
import { getBeachFromGoogleUrl } from "@/lib/api/google-places"
import { GoogleRestaurantInfo } from "./GoogleRestaurantInfo"
import { Loader2, Search, AlertCircle } from "lucide-react"

interface BeachesEditFormProps {
  beaches: Beach[]
  guideId: string
  onBeachesChange: (beaches: Beach[]) => void
}

export function BeachesEditForm({ beaches, guideId, onBeachesChange }: BeachesEditFormProps) {
  const [editingBeach, setEditingBeach] = useState<Beach | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleUrl, setGoogleUrl] = useState("")
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleBeachData, setGoogleBeachData] = useState<Partial<Beach> | null>(null)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const handleEdit = (beach: Beach) => {
    setEditingBeach(beach)
    setIsAddingNew(false)
    setGoogleUrl(beach.url || "")
    setGoogleBeachData(null)
    setGoogleError(null)
  }

  const handleAddNew = () => {
    setEditingBeach({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      name: "",
      description: "",
      address: "",
      distance: null,
      amenities: [],
      rating: null,
      review_count: null,
      price_range: "",
      badge: "",
      image_url: "",
      url: "",
      order_index: beaches.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
    setGoogleUrl("")
    setGoogleBeachData(null)
    setGoogleError(null)
  }

  const handleFetchFromGoogle = async () => {
    if (!googleUrl.trim()) {
      setGoogleError("Por favor, ingresa una URL de Google Maps.")
      return
    }

    setGoogleLoading(true)
    setGoogleError(null)
    setGoogleBeachData(null)

    try {
      console.log("[BeachesEditForm] Iniciando búsqueda con URL:", googleUrl)
      const data = await getBeachFromGoogleUrl(googleUrl)
      if (data) {
        console.log("[BeachesEditForm] Datos obtenidos:", data)
        setGoogleBeachData(data)
      } else {
        setGoogleError("No se pudo obtener información de Google para esa URL. Por favor, verifica que la URL sea válida.")
      }
    } catch (error: any) {
      console.error("[BeachesEditForm] Error fetching from Google:", error)
      setGoogleError(error.message || "Error al buscar en Google. Por favor, verifica que la URL sea válida.")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleUseGoogleData = () => {
    if (!googleBeachData) return

    setEditingBeach((prev) => ({
      ...prev!,
      name: googleBeachData.name || prev?.name || "",
      description: googleBeachData.description || prev?.description || "",
      address: googleBeachData.address || prev?.address || "",
      rating: googleBeachData.rating || prev?.rating || null,
      review_count: googleBeachData.review_count || prev?.review_count || null,
      price_range: googleBeachData.price_range || prev?.price_range || "",
      badge: googleBeachData.badge || prev?.badge || "",
      image_url: googleBeachData.image_url || prev?.image_url || "",
      url: googleBeachData.url || googleUrl || prev?.url || "",
    }))

    setGoogleBeachData(null)
    setGoogleUrl("")
  }

  const handleEditManually = () => {
    setGoogleBeachData(null)
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
          address: editingBeach.address,
          distance: editingBeach.distance,
          rating: editingBeach.rating,
          review_count: editingBeach.review_count,
          price_range: editingBeach.price_range,
          badge: editingBeach.badge,
          image_url: editingBeach.image_url,
          url: editingBeach.url,
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
          address: editingBeach.address,
          distance: editingBeach.distance,
          rating: editingBeach.rating,
          review_count: editingBeach.review_count,
          price_range: editingBeach.price_range,
          badge: editingBeach.badge,
          image_url: editingBeach.image_url,
          url: editingBeach.url,
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
    setGoogleUrl("")
    setGoogleBeachData(null)
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
              <i className="fas fa-umbrella-beach text-blue-600"></i>
              Playas ({beaches.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading} className="w-full md:w-auto">
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
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-umbrella-beach text-blue-600"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <CardTitle className="text-lg truncate">{beach.name}</CardTitle>
                            {beach.badge && (
                              <Badge variant="secondary" className="flex-shrink-0">{beach.badge}</Badge>
                            )}
                          </div>
                          {beach.description && (
                            <p className="text-sm text-gray-600 mb-2 break-words">{beach.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(beach)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-700 w-full sm:w-auto"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(beach.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 w-full sm:w-auto"
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
                    placeholder="Pega aquí la URL de búsqueda de Google de la playa"
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
                    ? "Pega la URL completa de una búsqueda de Google de la playa para obtener automáticamente su información"
                    : "Actualiza la información de la playa pegando una nueva URL de búsqueda de Google"}
                </p>
                {googleError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{googleError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Mostrar información de Google si está disponible */}
              {googleBeachData && (
                <GoogleRestaurantInfo
                  restaurantData={googleBeachData as any}
                  onUseData={handleUseGoogleData}
                  onEditManually={handleEditManually}
                  loading={googleLoading}
                />
              )}

              {/* Formulario manual (solo si no hay datos de Google disponibles) */}
              {!googleBeachData && (
                <>
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
                    onChange={(e) => setEditingBeach({ ...editingBeach, distance: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Ej: 5 minutos en coche"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                <Label htmlFor="beach-address">Dirección</Label>
                <Input
                  id="beach-address"
                  value={editingBeach.address || ''}
                  onChange={(e) => setEditingBeach({ ...editingBeach, address: e.target.value })}
                  placeholder="Dirección de la playa"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beach-rating">Calificación (1-5)</Label>
                  <Input
                    id="beach-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editingBeach.rating !== null ? editingBeach.rating : ''}
                    onChange={(e) => setEditingBeach({ ...editingBeach, rating: e.target.value ? Number.parseFloat(e.target.value) : null })}
                    placeholder="4.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beach-reviews">Número de Reseñas</Label>
                  <Input
                    id="beach-reviews"
                    type="number"
                    min="0"
                    value={editingBeach.review_count !== null ? editingBeach.review_count : ''}
                    onChange={(e) => setEditingBeach({ ...editingBeach, review_count: e.target.value ? Number.parseInt(e.target.value) : null })}
                    placeholder="150"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beach-price">Rango de Precio</Label>
                  <Input
                    id="beach-price"
                    value={editingBeach.price_range || ''}
                    onChange={(e) => setEditingBeach({ ...editingBeach, price_range: e.target.value })}
                    placeholder="€20-€40"
                  />
                </div>
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
                <Label htmlFor="beach-url">URL del Lugar (Google Maps, Web, etc.)</Label>
                <Input
                  id="beach-url"
                  value={editingBeach.url || ''}
                  onChange={(e) => setEditingBeach({ ...editingBeach, url: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
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
