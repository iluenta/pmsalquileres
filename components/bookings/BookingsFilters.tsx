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
  search: string
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
    filters.search !== "" ||
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
      search: "",
      statusId: "all",
      bookingTypeId: "all",
      dateRange: "all",
    })
  }

  return (
    <div className="bg-white p-6 md:p-6 rounded-[2rem] border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
            <Filter className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tighter">Filtros de Búsqueda</h3>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Encuentra reservas rápidamente</p>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 rounded-xl px-4 font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <X className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Filtro por Propiedad */}
        <div className="space-y-2">
          <Label htmlFor="filter-property" className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">
            Propiedad
          </Label>
          <Select
            value={filters.propertyId}
            onValueChange={(value) => handleFilterChange("propertyId", value)}
          >
            <SelectTrigger id="filter-property" className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500">
              <SelectValue placeholder="Todas las propiedades" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
              <SelectItem value="all" className="font-bold">Todas las propiedades</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id} className="font-medium">
                  {property.name} <span className="text-[10px] text-slate-400 ml-1">({property.property_code})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Búsqueda Global (Nombre, Teléfono, Email, Localizador) */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="filter-search" className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">
            Búsqueda Rápida
          </Label>
          <Input
            id="filter-search"
            placeholder="Buscar por nombre, teléfono, email o localizador..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>

        {/* Filtro por Estado */}
        <div className="space-y-2">
          <Label htmlFor="filter-status" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Estado
          </Label>
          <Select
            value={filters.statusId}
            onValueChange={(value) => handleFilterChange("statusId", value)}
          >
            <SelectTrigger id="filter-status" className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
              <SelectItem value="all" className="font-bold">Todos los estados</SelectItem>
              {bookingStatuses.map((status) => (
                <SelectItem key={status.id} value={status.id} className="font-medium">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Tipo de Reserva */}
        <div className="space-y-2">
          <Label htmlFor="filter-booking-type" className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">
            Tipo de Reserva
          </Label>
          <Select
            value={filters.bookingTypeId}
            onValueChange={(value) => handleFilterChange("bookingTypeId", value)}
            disabled={!bookingTypes || bookingTypes.length === 0}
          >
            <SelectTrigger id="filter-booking-type" className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
              <SelectItem value="all" className="font-bold">Todos los tipos</SelectItem>
              {bookingTypes && bookingTypes.length > 0 && bookingTypes.map((type) => (
                <SelectItem key={type.id} value={type.id} className="font-medium">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro Temporal */}
        <div className="space-y-2">
          <Label htmlFor="filter-date-range" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
            Período
          </Label>
          <Select
            value={filters.dateRange}
            onValueChange={(value) => handleFilterChange("dateRange", value)}
          >
            <SelectTrigger id="filter-date-range" className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="font-medium">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

