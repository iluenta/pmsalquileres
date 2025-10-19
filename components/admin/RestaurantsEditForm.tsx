"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Restaurant } from "@/types/guides"
import { createRestaurant, updateRestaurant, deleteRestaurant } from "@/lib/api/guides-client"

interface RestaurantsEditFormProps {
  restaurants: Restaurant[]
  guideId: string
  onRestaurantsChange: (restaurants: Restaurant[]) => void
}

export function RestaurantsEditForm({ restaurants, guideId, onRestaurantsChange }: RestaurantsEditFormProps) {
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingRestaurant({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      name: "",
      description: "",
      cuisine_type: "",
      distance: null,
      rating: 0,
      review_count: 0,
      price_range: "",
      badge: "",
      image_url: "",
      order_index: restaurants.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
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
          rating: editingRestaurant.rating,
          review_count: editingRestaurant.review_count,
          price_range: editingRestaurant.price_range,
          badge: editingRestaurant.badge,
          image_url: editingRestaurant.image_url,
          order_index: editingRestaurant.order_index
        })
        
        if (newRestaurant) {
          onRestaurantsChange([...restaurants, newRestaurant])
        }
      } else {
        // Actualizar restaurante existente
        const updatedRestaurant = await updateRestaurant(editingRestaurant.id, {
          name: editingRestaurant.name,
          description: editingRestaurant.description,
          rating: editingRestaurant.rating,
          review_count: editingRestaurant.review_count,
          price_range: editingRestaurant.price_range,
          badge: editingRestaurant.badge,
          image_url: editingRestaurant.image_url,
          order_index: editingRestaurant.order_index
        })
        
        if (updatedRestaurant) {
          onRestaurantsChange(restaurants.map(restaurant => restaurant.id === editingRestaurant.id ? updatedRestaurant : restaurant))
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
    if (confirm("¿Estás seguro de que quieres eliminar este restaurante?")) {
      try {
        setLoading(true)
        const success = await deleteRestaurant(restaurantId)
        if (success) {
          onRestaurantsChange(restaurants.filter(restaurant => restaurant.id !== restaurantId))
        }
      } catch (error) {
        console.error('Error deleting restaurant:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCancel = () => {
    setEditingRestaurant(null)
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
              <i className="fas fa-utensils text-orange-600"></i>
              Restaurantes ({restaurants.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading}>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-utensils text-orange-600"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                            {restaurant.badge && (
                              <Badge variant="secondary">{restaurant.badge}</Badge>
                            )}
                          </div>
                          {restaurant.description && (
                            <p className="text-sm text-gray-600 mb-2">{restaurant.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(restaurant)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(restaurant.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
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

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-rating">Calificación (1-5)</Label>
                  <Input
                    id="restaurant-rating"
                    type="number"
                    min="1"
                    max="5"
                    value={editingRestaurant.rating || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, rating: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                    placeholder="5"
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
                    placeholder="€€€"
                  />
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
