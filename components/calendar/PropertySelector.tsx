"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Property } from "@/lib/api/properties"

interface PropertySelectorProps {
  selectedProperty: string
  onPropertyChange: (propertyId: string) => void
  properties: Property[]
  compact?: boolean
}

export function PropertySelector({ selectedProperty, onPropertyChange, properties, compact = false }: PropertySelectorProps) {
  const property = properties.find(p => p.id === selectedProperty)
  
  // Asegurar que el valor sea válido (existe en las propiedades) o undefined
  const validValue = selectedProperty && properties.some(p => p.id === selectedProperty) 
    ? selectedProperty 
    : undefined

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Select 
          value={validValue} 
          onValueChange={onPropertyChange}
        >
          <SelectTrigger className="w-64 h-9 bg-background">
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
          <span className="text-xs text-muted-foreground">
            {[property.city, property.province].filter(Boolean).join(", ")}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">Propiedad</label>
      <Select 
        value={validValue} 
        onValueChange={onPropertyChange}
      >
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
  )
}

