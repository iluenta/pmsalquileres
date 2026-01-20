"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2 } from "lucide-react"
import type { Property } from "@/lib/api/properties"

interface PropertySelectorProps {
  selectedProperty: string
  onPropertyChange: (propertyId: string) => void
  properties: Property[]
  compact?: boolean
}

export function PropertySelector({ selectedProperty, onPropertyChange, properties, compact = false }: PropertySelectorProps) {
  const property = properties.find(p => p.id === selectedProperty)

  const validValue = selectedProperty && properties.some(p => p.id === selectedProperty)
    ? selectedProperty
    : undefined

  return (
    <div className={`flex items-center gap-4 ${compact ? "" : "w-full md:w-auto"}`}>
      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-indigo-200">
        <Building2 className="w-4 h-4 text-slate-400" />
        <Select
          value={validValue}
          onValueChange={onPropertyChange}
        >
          <SelectTrigger className="w-64 h-8 border-none bg-transparent p-0 focus:ring-0 shadow-none font-bold text-slate-700">
            <SelectValue placeholder="Seleccione una propiedad" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-200 shadow-xl bg-white">
            {properties.map((prop) => (
              <SelectItem key={prop.id} value={prop.id} className="font-bold text-slate-600 py-3 rounded-xl focus:bg-indigo-50 transition-colors">
                <span className="text-slate-400 mr-2 text-[10px] uppercase tracking-widest">{prop.property_code}</span>
                {prop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {property && (property.city || property.province) && (
        <div className="hidden lg:flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Ubicación</span>
          <span className="text-xs font-bold text-slate-600">
            {[property.city, property.province].filter(Boolean).join(", ")}
          </span>
        </div>
      )}
    </div>
  )
}
