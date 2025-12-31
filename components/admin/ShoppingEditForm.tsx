"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shopping } from "@/types/guides"
import { createShopping, updateShopping, deleteShopping } from "@/lib/api/guides-client"
import { getShoppingFromGoogleUrl } from "@/lib/api/google-places"
import { GoogleShoppingInfo } from "./GoogleShoppingInfo"
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

interface ShoppingEditFormProps {
  shopping: Shopping[]
  guideId: string
  onShoppingChange: (shopping: Shopping[]) => void
  propertyLatitude?: number | null
  propertyLongitude?: number | null
}

export function ShoppingEditForm({ shopping, guideId, onShoppingChange, propertyLatitude, propertyLongitude }: ShoppingEditFormProps) {

  const [editingShopping, setEditingShopping] = useState<Shopping | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleUrl, setGoogleUrl] = useState("")
  const [googleShoppingData, setGoogleShoppingData] = useState<Partial<Shopping> | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleEdit = (place: Shopping) => {
    setEditingShopping(place)
    setIsAddingNew(false)
    setGoogleUrl(place.url || "") // Cargar URL existente si está disponible
    setGoogleShoppingData(null) // Limpiar datos de Google al editar
    setGoogleError(null)
  }

  const handleAddNew = () => {
    setEditingShopping({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      name: "",
      description: "",
      address: "",
      shopping_type: "",
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
      order_index: shopping.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
    setGoogleUrl("")
    setGoogleShoppingData(null)
    setGoogleError(null)
  }

  const handleSave = async () => {
    if (!editingShopping) return

    try {
      setLoading(true)

      if (isAddingNew) {
        // Crear nuevo lugar de compras
        const newShopping = await createShopping({
          guide_id: guideId,
          name: editingShopping.name,
          description: editingShopping.description,
          address: editingShopping.address,
          shopping_type: editingShopping.shopping_type,
          rating: editingShopping.rating,
          review_count: editingShopping.review_count,
          price_range: editingShopping.price_range,
          walking_time: editingShopping.walking_time,
          driving_time: editingShopping.driving_time,
          badge: editingShopping.badge,
          image_url: editingShopping.image_url,
          url: editingShopping.url,
          phone: editingShopping.phone,
          website: editingShopping.website,
          opening_hours: editingShopping.opening_hours,
          order_index: editingShopping.order_index
        })

        if (newShopping) {
          onShoppingChange([...shopping, newShopping])
          toast({
            title: "Lugar guardado",
            description: "El lugar de compras ha sido creado correctamente.",
          })
        }
      } else {
        // Actualizar lugar de compras existente
        const updatedShopping = await updateShopping(editingShopping.id, {
          name: editingShopping.name,
          description: editingShopping.description,
          address: editingShopping.address,
          shopping_type: editingShopping.shopping_type,
          rating: editingShopping.rating,
          review_count: editingShopping.review_count,
          price_range: editingShopping.price_range,
          walking_time: editingShopping.walking_time,
          driving_time: editingShopping.driving_time,
          badge: editingShopping.badge,
          image_url: editingShopping.image_url,
          url: editingShopping.url,
          phone: editingShopping.phone,
          website: editingShopping.website,
          opening_hours: editingShopping.opening_hours,
          order_index: editingShopping.order_index
        })

        if (updatedShopping) {
          onShoppingChange(shopping.map(place => place.id === editingShopping.id ? updatedShopping : place))
          toast({
            title: "Lugar actualizado",
            description: "La información ha sido actualizada correctamente.",
          })
        }
      }

      setEditingShopping(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving shopping:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (placeId: string) => {
    try {
      setLoading(true)
      const success = await deleteShopping(placeId)
      if (success) {
        onShoppingChange(shopping.filter(place => place.id !== placeId))
        toast({
          title: "Lugar eliminado",
          description: "El lugar de compras ha sido eliminado correctamente.",
        })
      }
    } catch (error) {
      console.error('Error deleting shopping:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el lugar de compras.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingShopping(null)
    setIsAddingNew(false)
    setGoogleUrl("")
    setGoogleShoppingData(null)
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
      setGoogleShoppingData(null)

      const shoppingData = await getShoppingFromGoogleUrl(googleUrl, propertyLatitude || undefined, propertyLongitude || undefined)

      if (shoppingData) {
        setGoogleShoppingData(shoppingData)
      } else {
        setGoogleError("No se pudo encontrar información del lugar de compras en Google. Intenta con otra URL o completa el formulario manualmente.")
      }
    } catch (error) {
      console.error("Error fetching from Google:", error)
      setGoogleError("Error al buscar en Google. Por favor, intenta de nuevo o completa el formulario manualmente.")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleUseGoogleData = () => {
    if (!googleShoppingData) return

    // Copiar datos de Google al formulario editable, preservando el ID y otros campos si se está editando
    setEditingShopping((prev) => ({
      ...prev!,
      name: googleShoppingData.name || prev?.name || "",
      description: googleShoppingData.description || prev?.description || "",
      address: googleShoppingData.address || prev?.address || "",
      shopping_type: googleShoppingData.shopping_type || prev?.shopping_type || "",
      rating: googleShoppingData.rating || prev?.rating || 0,
      review_count: googleShoppingData.review_count || prev?.review_count || 0,
      walking_time: googleShoppingData.walking_time ?? prev?.walking_time ?? null,
      driving_time: googleShoppingData.driving_time ?? prev?.driving_time ?? null,
      price_range: googleShoppingData.price_range || prev?.price_range || "",
      badge: googleShoppingData.badge || prev?.badge || "",
      image_url: googleShoppingData.image_url || prev?.image_url || "",
      url: googleShoppingData.url || googleUrl || prev?.url || "",
      phone: googleShoppingData.phone || prev?.phone || "",
      website: googleShoppingData.website || prev?.website || "",
      opening_hours: googleShoppingData.opening_hours || prev?.opening_hours || null,
    }))

    // Limpiar datos de Google para mostrar el formulario
    setGoogleShoppingData(null)
    setGoogleUrl("")
  }

  const handleEditManually = () => {
    // Limpiar datos de Google y mostrar formulario vacío
    setGoogleShoppingData(null)
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
              <i className="fas fa-shopping-bag text-blue-600"></i>
              Compras ({shopping.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading} className="w-full md:w-auto">
              <i className="fas fa-plus mr-2"></i>
              Agregar Lugar de Compras
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shopping.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-shopping-bag text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No hay lugares de compras agregados</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">Agrega supermercados y centros comerciales que recomiendas a tus huéspedes</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {shopping.map((place) => (
                <Card key={place.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-shopping-bag text-blue-600"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <CardTitle className="text-lg truncate">{place.name}</CardTitle>
                            {place.badge && (
                              <Badge variant="secondary" className="flex-shrink-0">{place.badge}</Badge>
                            )}
                            {place.shopping_type && (
                              <Badge variant="outline" className="flex-shrink-0">{place.shopping_type}</Badge>
                            )}
                          </div>
                          {place.description && (
                            <p className="text-sm text-gray-600 mb-2 break-words">{place.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {place.rating && place.rating > 0 && (
                              <div className="flex items-center gap-1">
                                {renderStars(place.rating)}
                                <span className="ml-1">({place.rating})</span>
                              </div>
                            )}
                            {place.review_count && place.review_count > 0 && (
                              <span>({place.review_count} reseñas)</span>
                            )}
                            {place.price_range && (
                              <span className="font-medium">{place.price_range}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(place)}
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
                                Esta acción eliminará de forma permanente el lugar de compras "{place.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(place.id)}
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
                  {place.image_url && (
                    <CardContent className="pt-0">
                      <img
                        src={place.image_url}
                        alt={place.name}
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
      {editingShopping && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Agregar Nuevo Lugar de Compras' : 'Editar Lugar de Compras'}
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
                    placeholder="Pega aquí la URL de búsqueda de Google del lugar de compras"
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
                    ? "Pega la URL completa de una búsqueda de Google del lugar de compras para obtener automáticamente su información"
                    : "Actualiza la información del lugar de compras pegando una nueva URL de búsqueda de Google"}
                </p>
                {googleError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{googleError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Mostrar información de Google si está disponible */}
              {googleShoppingData && (
                <GoogleShoppingInfo
                  shoppingData={googleShoppingData}
                  onUseData={handleUseGoogleData}
                  onEditManually={handleEditManually}
                  loading={googleLoading}
                />
              )}

              {/* Formulario manual (solo si no hay datos de Google disponibles) */}
              {!googleShoppingData && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shopping-name">Nombre</Label>
                    <Input
                      id="shopping-name"
                      value={editingShopping.name || ''}
                      onChange={(e) => setEditingShopping({ ...editingShopping, name: e.target.value })}
                      placeholder="Nombre del supermercado o centro comercial"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopping-type">Tipo</Label>
                    <Select
                      value={editingShopping.shopping_type || ''}
                      onValueChange={(value) => setEditingShopping({ ...editingShopping, shopping_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supermercado">Supermercado</SelectItem>
                        <SelectItem value="centro_comercial">Centro Comercial</SelectItem>
                        <SelectItem value="tienda">Tienda</SelectItem>
                        <SelectItem value="farmacia">Farmacia</SelectItem>
                        <SelectItem value="mercado">Mercado</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopping-description">Descripción</Label>
                    <Textarea
                      id="shopping-description"
                      value={editingShopping.description || ''}
                      onChange={(e) => setEditingShopping({ ...editingShopping, description: e.target.value })}
                      placeholder="Descripción del lugar"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopping-address">Dirección</Label>
                    <Input
                      id="shopping-address"
                      value={editingShopping.address || ''}
                      onChange={(e) => setEditingShopping({ ...editingShopping, address: e.target.value })}
                      placeholder="Dirección del lugar"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopping-rating">Calificación (1-5)</Label>
                      <Input
                        id="shopping-rating"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={editingShopping.rating || ''}
                        onChange={(e) => setEditingShopping({ ...editingShopping, rating: e.target.value ? Number.parseFloat(e.target.value) : 0 })}
                        placeholder="4.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopping-reviews">Número de Reseñas</Label>
                      <Input
                        id="shopping-reviews"
                        type="number"
                        min="0"
                        value={editingShopping.review_count || ''}
                        onChange={(e) => setEditingShopping({ ...editingShopping, review_count: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                        placeholder="150"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopping-price">Rango de Precio</Label>
                      <Input
                        id="shopping-price"
                        value={editingShopping.price_range || ''}
                        onChange={(e) => setEditingShopping({ ...editingShopping, price_range: e.target.value })}
                        placeholder="€, €€, €€€"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopping-walking-time">Tiempo caminando (minutos)</Label>
                      <Input
                        id="shopping-walking-time"
                        type="number"
                        min="0"
                        value={editingShopping.walking_time || ''}
                        onChange={(e) => setEditingShopping({ ...editingShopping, walking_time: e.target.value ? Number.parseInt(e.target.value) : null })}
                        placeholder="Ej: 15"
                      />
                      <p className="text-xs text-gray-500">
                        Tiempo en minutos caminando desde la propiedad
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopping-driving-time">Tiempo en coche (minutos)</Label>
                      <Input
                        id="shopping-driving-time"
                        type="number"
                        min="0"
                        value={editingShopping.driving_time || ''}
                        onChange={(e) => setEditingShopping({ ...editingShopping, driving_time: e.target.value ? Number.parseInt(e.target.value) : null })}
                        placeholder="Ej: 3"
                      />
                      <p className="text-xs text-gray-500">
                        Tiempo en minutos en coche desde la propiedad
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopping-badge">Badge</Label>
                      <Input
                        id="shopping-badge"
                        value={editingShopping.badge || ''}
                        onChange={(e) => setEditingShopping({ ...editingShopping, badge: e.target.value })}
                        placeholder="Ej: Recomendado"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shopping-order">Orden</Label>
                      <Input
                        id="shopping-order"
                        type="number"
                        value={editingShopping.order_index || ''}
                        onChange={(e) => setEditingShopping({ ...editingShopping, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopping-image">URL de Imagen</Label>
                    <Input
                      id="shopping-image"
                      value={editingShopping.image_url || ''}
                      onChange={(e) => setEditingShopping({ ...editingShopping, image_url: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopping-url">URL del Lugar / Sitio Web</Label>
                    <Input
                      id="shopping-url"
                      value={editingShopping.url || ''}
                      onChange={(e) => setEditingShopping({ ...editingShopping, url: e.target.value })}
                      placeholder="https://maps.google.com/... o https://lugar.com"
                    />
                    <p className="text-xs text-gray-500">URL de Google Maps o sitio web del lugar</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopping-phone">Teléfono</Label>
                      <Input
                        id="shopping-phone"
                        value={editingShopping.phone || ''}
                        onChange={(e) => setEditingShopping({ ...editingShopping, phone: e.target.value })}
                        placeholder="Ej: +34 912 345 678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopping-opening-hours">Horarios (una línea por día)</Label>
                    <Textarea
                      id="shopping-opening-hours"
                      value={editingShopping.opening_hours?.weekday_text?.join('\n') || ''}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(line => line.trim() !== '')
                        setEditingShopping({
                          ...editingShopping,
                          opening_hours: {
                            ...editingShopping.opening_hours,
                            weekday_text: lines,
                            open_now: editingShopping.opening_hours?.open_now ?? false
                          }
                        })
                      }}
                      placeholder={"Lunes: 9:00–18:00\nMartes: 9:00–18:00\n..."}
                      rows={7}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Guardar
                        </>
                      )}
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

