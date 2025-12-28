"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shopping } from "@/types/guides"
import { Loader2, ExternalLink } from "lucide-react"

interface GoogleShoppingInfoProps {
  shoppingData: Partial<Shopping>
  onUseData: () => void
  onEditManually: () => void
  loading?: boolean
}

export function GoogleShoppingInfo({
  shoppingData,
  onUseData,
  onEditManually,
  loading = false,
}: GoogleShoppingInfoProps) {
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <i key={i} className="fas fa-star text-yellow-400" />
        )
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <i key={i} className="fas fa-star-half-alt text-yellow-400" />
        )
      } else {
        stars.push(
          <i key={i} className="fas fa-star text-gray-300" />
        )
      }
    }
    return <div className="flex gap-1">{stars}</div>
  }

  if (loading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Buscando información en Google...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
              <i className="fab fa-google mr-1"></i>
              Datos de Google
            </Badge>
            <span className="text-sm text-gray-500">Información obtenida automáticamente</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Imagen */}
        {shoppingData.image_url && (
          <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
            <img
              src={shoppingData.image_url}
              alt={shoppingData.name || "Lugar de compras"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Nombre */}
        {shoppingData.name && (
          <div>
            <h3 className="text-xl font-bold text-gray-900">{shoppingData.name}</h3>
          </div>
        )}

        {/* Descripción */}
        {shoppingData.description && (
          <div>
            <p className="text-gray-700 leading-relaxed">{shoppingData.description}</p>
          </div>
        )}

        {/* Dirección */}
        {shoppingData.address && (
          <div>
            <p className="text-gray-600 text-sm">
              <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i>
              {shoppingData.address}
            </p>
          </div>
        )}

        {/* Tipo de compras */}
        {shoppingData.shopping_type && (
          <div>
            <Badge variant="outline">{shoppingData.shopping_type}</Badge>
          </div>
        )}

        {/* Rating y Reseñas */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {shoppingData.rating && shoppingData.rating > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(shoppingData.rating)}
              <span className="font-medium text-gray-700">
                {shoppingData.rating.toFixed(1)}
              </span>
            </div>
          )}
          {shoppingData.review_count && shoppingData.review_count > 0 && (
            <span className="text-gray-600">
              ({shoppingData.review_count} reseñas)
            </span>
          )}
          {shoppingData.price_range && (
            <span className="font-medium text-gray-700">{shoppingData.price_range}</span>
          )}
        </div>

        {/* Badge */}
        {shoppingData.badge && (
          <div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
              {shoppingData.badge}
            </Badge>
          </div>
        )}

        {/* URL */}
        {shoppingData.url && (
          <div className="text-sm">
            <a
              href={shoppingData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver en Google Maps
            </a>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
          <Button
            onClick={onUseData}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <i className="fas fa-check mr-2"></i>
            Usar estos datos
          </Button>
          <Button
            onClick={onEditManually}
            variant="outline"
            className="flex-1"
          >
            <i className="fas fa-edit mr-2"></i>
            Editar manualmente
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

