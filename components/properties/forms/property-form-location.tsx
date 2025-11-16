"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PropertyFormLocationProps {
  formData: {
    street: string
    number: string
    city: string
    province: string
    postal_code: string
    country: string
  }
  onFieldChange: (field: string, value: any) => void
}

export function PropertyFormLocation({
  formData,
  onFieldChange,
}: PropertyFormLocationProps) {
  return (
    <div className="space-y-6">
      {/* Location Section */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">📍</span> Dirección de la Propiedad
        </h3>
        <div className="bg-muted/30 p-4 md:p-6 rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="street" className="text-sm font-medium">
                Calle <span className="text-destructive">*</span>
              </Label>
              <Input
                id="street"
                placeholder="Ej: Avenida Principal"
                value={formData.street}
                onChange={(e) => onFieldChange("street", e.target.value)}
                className="mt-2 bg-background"
                required
              />
            </div>
            <div>
              <Label htmlFor="number" className="text-sm font-medium">
                Número <span className="text-destructive">*</span>
              </Label>
              <Input
                id="number"
                placeholder="123"
                value={formData.number}
                onChange={(e) => onFieldChange("number", e.target.value)}
                className="mt-2 bg-background"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="text-sm font-medium">
                Ciudad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Ciudad"
                value={formData.city}
                onChange={(e) => onFieldChange("city", e.target.value)}
                className="mt-2 bg-background"
                required
              />
            </div>
            <div>
              <Label htmlFor="province" className="text-sm font-medium">
                Provincia <span className="text-destructive">*</span>
              </Label>
              <Input
                id="province"
                placeholder="Provincia"
                value={formData.province}
                onChange={(e) => onFieldChange("province", e.target.value)}
                className="mt-2 bg-background"
                required
              />
            </div>
            <div>
              <Label htmlFor="postal_code" className="text-sm font-medium">
                Código Postal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postal_code"
                placeholder="28001"
                value={formData.postal_code}
                onChange={(e) => onFieldChange("postal_code", e.target.value)}
                className="mt-2 bg-background"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country" className="text-sm font-medium">
              País <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              placeholder="País"
              value={formData.country}
              onChange={(e) => onFieldChange("country", e.target.value)}
              className="mt-2 bg-background"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )
}

