"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PropertyFormCharacteristicsProps {
  formData: {
    bedrooms: number
    bathrooms: number
    max_guests: number
    square_meters: number
    min_nights: number
  }
  onFieldChange: (field: string, value: any) => void
}

export function PropertyFormCharacteristics({
  formData,
  onFieldChange,
}: PropertyFormCharacteristicsProps) {
  return (
    <div className="space-y-6">
      {/* Characteristics Section */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">🏠</span> Detalles de la Propiedad
        </h3>
        <div className="bg-muted/30 p-4 md:p-6 rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="bedrooms" className="text-sm font-medium">
                Habitaciones
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms || 0}
                onChange={(e) => onFieldChange("bedrooms", parseInt(e.target.value) || 0)}
                className="mt-2 bg-background"
              />
            </div>
            <div>
              <Label htmlFor="bathrooms" className="text-sm font-medium">
                Baños
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                value={formData.bathrooms || 0}
                onChange={(e) => onFieldChange("bathrooms", parseInt(e.target.value) || 0)}
                className="mt-2 bg-background"
              />
            </div>
            <div>
              <Label htmlFor="max_guests" className="text-sm font-medium">
                Huéspedes Máx.
              </Label>
              <Input
                id="max_guests"
                type="number"
                min="0"
                value={formData.max_guests || 0}
                onChange={(e) => onFieldChange("max_guests", parseInt(e.target.value) || 0)}
                className="mt-2 bg-background"
              />
            </div>
            <div>
              <Label htmlFor="square_meters" className="text-sm font-medium">
                Metros²
              </Label>
              <Input
                id="square_meters"
                type="number"
                min="0"
                placeholder="0"
                value={formData.square_meters || 0}
                onChange={(e) => onFieldChange("square_meters", parseInt(e.target.value) || 0)}
                className="mt-2 bg-background"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="min_nights" className="text-sm font-medium">
              Noches Mínimas <span className="text-destructive">*</span>
            </Label>
            <Input
              id="min_nights"
              type="number"
              min="1"
              placeholder="Número mínimo de noches"
              value={formData.min_nights || 1}
              onChange={(e) => onFieldChange("min_nights", parseInt(e.target.value) || 1)}
              className="mt-2 bg-background"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Número mínimo de noches requeridas para reservas comerciales
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

