"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"
import type { Property } from "@/lib/api/properties"
import type { ConfigurationValue } from "@/lib/api/configuration"

export interface BookingsFiltersState {
  propertyId: string // "all" para todas las propiedades
  guestName: string
  phone: string
  statusId: string // "all" para todos los estados
  bookingTypeId: string // "all" para todos los tipos
  dateRange: string
}

interface BookingsFiltersProps {
  properties: Property[]
  bookingStatuses: ConfigurationValue[]
  bookingTypes?: ConfigurationValue[] // Opcional con valor por defecto
  filters: BookingsFiltersState
  onFiltersChange: (filters: BookingsFiltersState) => void
}

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "next7days", label: "Próximos 7 días" },
  { value: "thisMonth", label: "Este mes" },
  { value: "nextMonth", label: "Próximo mes" },
  { value: "last7days", label: "Últimos 7 días" },
  { value: "lastMonth", label: "Último mes" },
]

export function BookingsFilters({
  properties,
  bookingStatuses,
  bookingTypes = [], // Valor por defecto
  filters,
  onFiltersChange,
}: BookingsFiltersProps) {
  const hasActiveFilters =
    filters.propertyId !== "all" ||
    filters.guestName !== "" ||
    filters.phone !== "" ||
    filters.statusId !== "all" ||
    filters.bookingTypeId !== "all" ||
    filters.dateRange !== "all"

  const handleFilterChange = (key: keyof BookingsFiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      propertyId: "all",
      guestName: "",
      phone: "",
      statusId: "all",
      bookingTypeId: "all",
      dateRange: "all",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Filtro por Propiedad */}
          <div className="space-y-2">
            <Label htmlFor="filter-property">Propiedad</Label>
            <Select
              value={filters.propertyId}
              onValueChange={(value) => handleFilterChange("propertyId", value)}
            >
              <SelectTrigger id="filter-property" className="w-full">
                <SelectValue placeholder="Todas las propiedades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las propiedades</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} ({property.property_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Nombre del Huésped */}
          <div className="space-y-2">
            <Label htmlFor="filter-guest-name">Nombre del Huésped</Label>
            <Input
              id="filter-guest-name"
              placeholder="Buscar por nombre..."
              value={filters.guestName}
              onChange={(e) => handleFilterChange("guestName", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filtro por Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="filter-phone">Teléfono</Label>
            <Input
              id="filter-phone"
              placeholder="Buscar por teléfono..."
              value={filters.phone}
              onChange={(e) => handleFilterChange("phone", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="space-y-2">
            <Label htmlFor="filter-status">Estado</Label>
            <Select
              value={filters.statusId}
              onValueChange={(value) => handleFilterChange("statusId", value)}
            >
              <SelectTrigger id="filter-status" className="w-full">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {bookingStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Tipo de Reserva */}
          <div className="space-y-2">
            <Label htmlFor="filter-booking-type">Tipo de Reserva</Label>
            <Select
              value={filters.bookingTypeId}
              onValueChange={(value) => handleFilterChange("bookingTypeId", value)}
              disabled={!bookingTypes || bookingTypes.length === 0}
            >
              <SelectTrigger id="filter-booking-type" className="w-full">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {bookingTypes && bookingTypes.length > 0 && bookingTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Temporal */}
          <div className="space-y-2">
            <Label htmlFor="filter-date-range">Período</Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => handleFilterChange("dateRange", value)}
            >
              <SelectTrigger id="filter-date-range" className="w-full">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

