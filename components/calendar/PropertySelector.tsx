"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import type { Property } from "@/lib/api/properties"

interface PropertySelectorProps {
  selectedProperty: string
  onPropertyChange: (propertyId: string) => void
  properties: Property[]
}

export function PropertySelector({ selectedProperty, onPropertyChange, properties }: PropertySelectorProps) {
  const property = properties.find(p => p.id === selectedProperty)

  return (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Propiedad</label>
        <Select value={selectedProperty} onValueChange={onPropertyChange}>
          <SelectTrigger className="w-full md:w-64 bg-background">
            <SelectValue placeholder="Seleccione una propiedad" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((prop) => (
              <SelectItem key={prop.id} value={prop.id}>
                {prop.property_code} - {prop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {property && (property.city || property.province) && (
          <p className="text-xs text-muted-foreground">
            {[property.city, property.province].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </Card>
  )
}

