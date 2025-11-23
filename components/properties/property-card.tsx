"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, Pencil, Trash2, ExternalLink } from "lucide-react"
import Image from "next/image"
import type { Property } from "@/lib/api/properties"
import { useRouter } from "next/navigation"

interface PropertyCardProps {
  property: Property
  onEdit?: (property: Property) => void
  onDelete?: (propertyId: string) => void
  onViewGuide?: (property: Property) => void
}

export function PropertyCard({ property, onEdit, onDelete, onViewGuide }: PropertyCardProps) {
  const router = useRouter()

  const statusColors = {
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    inactive: "bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-200",
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const location = [property.city, property.province].filter(Boolean).join(", ")

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-border">
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {property.image_url ? (
          <Image
            src={property.image_url}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <div className="text-4xl">🏠</div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={statusColors[property.is_active ? "active" : "inactive"]}>
            {property.is_active ? "Activa" : "Inactiva"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-foreground mb-1">{property.name}</h3>
        <p className="text-xs text-muted-foreground mb-3">Código: {property.property_code}</p>

        {/* Property Type Badge */}
        {property.property_type && (
          <div className="mb-3">
            <Badge
              variant="outline"
              style={{
                backgroundColor: property.property_type.color
                  ? `${property.property_type.color}20`
                  : undefined,
                color: property.property_type.color || undefined,
                borderColor: property.property_type.color || undefined,
              }}
            >
              {property.property_type.label}
            </Badge>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <span>📍</span>
            <span>{location}</span>
          </div>
        )}

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {property.bedrooms ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground">Habitaciones</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {property.bathrooms ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground">Baños</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {property.max_guests ?? "-"}
            </p>
            <p className="text-xs text-muted-foreground">Huéspedes</p>
          </div>
        </div>

        {/* Price */}
        {property.base_price_per_night && (
          <div className="mb-4">
            <p className="text-xl font-bold text-primary">
              {formatCurrency(property.base_price_per_night)}
              <span className="text-sm text-muted-foreground font-normal">/noche</span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              if (onEdit) {
                onEdit(property)
              } else {
                router.push(`/dashboard/properties/${property.id}/edit`)
              }
            }}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          {property.slug && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.open(`/landing/${property.slug}`, "_blank")
              }}
              title="Ver Landing Pública"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onViewGuide) {
                onViewGuide(property)
              } else {
                window.open(`/guides/${property.slug || property.id}/public`, "_blank")
              }
            }}
            title="Ver Guía del Huésped"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(property.id)}
              title="Eliminar Propiedad"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

