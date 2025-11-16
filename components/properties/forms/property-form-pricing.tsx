"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PropertyFormPricingProps {
  formData: {
    base_price_per_night: number
    cleaning_fee: number
    security_deposit: number
    check_in_time: string
    check_out_time: string
  }
  onFieldChange: (field: string, value: any) => void
}

export function PropertyFormPricing({
  formData,
  onFieldChange,
}: PropertyFormPricingProps) {
  return (
    <div className="space-y-6">
      {/* Pricing Section */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">💰</span> Configuración de Precios y Tarifas
        </h3>
        <div className="bg-muted/30 p-4 md:p-6 rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="base_price_per_night" className="text-sm font-medium">
                Precio Base/Noche (€) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="base_price_per_night"
                type="number"
                step="0.01"
                min="0"
                placeholder="125"
                value={formData.base_price_per_night || 0}
                onChange={(e) => onFieldChange("base_price_per_night", parseFloat(e.target.value) || 0)}
                className="mt-2 bg-background"
                required
              />
            </div>
            <div>
              <Label htmlFor="cleaning_fee" className="text-sm font-medium">
                Tarifa de Limpieza (€)
              </Label>
              <Input
                id="cleaning_fee"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={formData.cleaning_fee || 0}
                onChange={(e) => onFieldChange("cleaning_fee", parseFloat(e.target.value) || 0)}
                className="mt-2 bg-background"
              />
            </div>
            <div>
              <Label htmlFor="security_deposit" className="text-sm font-medium">
                Depósito de Seguridad (€)
              </Label>
              <Input
                id="security_deposit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={formData.security_deposit || 0}
                onChange={(e) => onFieldChange("security_deposit", parseFloat(e.target.value) || 0)}
                className="mt-2 bg-background"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <Label className="text-sm font-medium mb-4 block">Horarios de Check-in/Check-out</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="check_in_time" className="text-xs font-medium">
                  Hora de Check-in
                </Label>
                <Input
                  id="check_in_time"
                  type="time"
                  value={formData.check_in_time || "15:00"}
                  onChange={(e) => onFieldChange("check_in_time", e.target.value)}
                  className="mt-2 bg-background"
                />
              </div>
              <div>
                <Label htmlFor="check_out_time" className="text-xs font-medium">
                  Hora de Check-out
                </Label>
                <Input
                  id="check_out_time"
                  type="time"
                  value={formData.check_out_time || "11:00"}
                  onChange={(e) => onFieldChange("check_out_time", e.target.value)}
                  className="mt-2 bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

