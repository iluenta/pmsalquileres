"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSeason } from "@/lib/contexts/season-context"
import { CalendarIcon, X, Filter } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { ReportsFilters } from "@/types/reports"
import type { Property } from "@/lib/api/properties"

interface ReportsFiltersProps {
  filters: ReportsFilters
  onFiltersChange: (filters: ReportsFilters) => void
  properties: Property[]
  channels: Array<{ id: string; name: string }>
  availableYears: number[]
}

export function ReportsFiltersComponent({
  filters,
  onFiltersChange,
  properties,
  channels,
  availableYears,
}: ReportsFiltersProps) {
  const { selectedYear } = useSeason()
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  )

  // Inicializar con el año del contexto si no hay fechas
  useEffect(() => {
    if (!dateFrom && !dateTo && selectedYear && !filters.dateFrom && !filters.dateTo) {
      const yearStart = new Date(selectedYear, 0, 1)
      const yearEnd = new Date(selectedYear, 11, 31)
      setDateFrom(yearStart)
      setDateTo(yearEnd)
      onFiltersChange({
        ...filters,
        year: selectedYear,
        dateFrom: yearStart.toISOString().split("T")[0],
        dateTo: yearEnd.toISOString().split("T")[0],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear])

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date)
    onFiltersChange({
      ...filters,
      dateFrom: date ? date.toISOString().split("T")[0] : undefined,
    })
  }

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date)
    onFiltersChange({
      ...filters,
      dateTo: date ? date.toISOString().split("T")[0] : undefined,
    })
  }

  const handleYearChange = (year: string) => {
    const yearNum = year === "all" ? null : parseInt(year, 10)
    const newFilters: ReportsFilters = {
      ...filters,
      year: yearNum || undefined,
    }
    
    if (yearNum) {
      const yearStart = new Date(yearNum, 0, 1)
      const yearEnd = new Date(yearNum, 11, 31)
      setDateFrom(yearStart)
      setDateTo(yearEnd)
      newFilters.dateFrom = yearStart.toISOString().split("T")[0]
      newFilters.dateTo = yearEnd.toISOString().split("T")[0]
    } else {
      setDateFrom(undefined)
      setDateTo(undefined)
      newFilters.dateFrom = undefined
      newFilters.dateTo = undefined
    }
    
    onFiltersChange(newFilters)
  }

  const handlePropertyChange = (propertyId: string) => {
    onFiltersChange({
      ...filters,
      propertyId: propertyId === "all" ? undefined : propertyId,
    })
  }

  const handleChannelChange = (channelId: string) => {
    onFiltersChange({
      ...filters,
      channelId: channelId === "all" ? undefined : channelId,
    })
  }

  const handleCompareToggle = (enabled: boolean) => {
    const newFilters: ReportsFilters = {
      ...filters,
      compareEnabled: enabled,
      compareYear: enabled && filters.year ? filters.year - 1 : undefined,
    }
    onFiltersChange(newFilters)
  }

  const handleCompareYearChange = (year: string) => {
    onFiltersChange({
      ...filters,
      compareYear: year === "none" ? undefined : parseInt(year, 10),
    })
  }

  const handleClearFilters = () => {
    const currentYear = selectedYear || new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31)
    
    setDateFrom(yearStart)
    setDateTo(yearEnd)
    
    onFiltersChange({
      year: currentYear,
      dateFrom: yearStart.toISOString().split("T")[0],
      dateTo: yearEnd.toISOString().split("T")[0],
      propertyId: undefined,
      channelId: undefined,
      compareEnabled: false,
      compareYear: undefined,
    })
  }

  const hasActiveFilters =
    filters.propertyId !== undefined ||
    filters.channelId !== undefined ||
    filters.compareEnabled ||
    (filters.dateFrom && filters.dateFrom !== new Date(filters.year || new Date().getFullYear(), 0, 1).toISOString().split("T")[0]) ||
    (filters.dateTo && filters.dateTo !== new Date(filters.year || new Date().getFullYear(), 11, 31).toISOString().split("T")[0])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <CardDescription>Filtra los datos de los reportes</CardDescription>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Año */}
          <div className="space-y-2">
            <Label htmlFor="year">Año</Label>
            <Select
              value={filters.year?.toString() || "all"}
              onValueChange={handleYearChange}
            >
              <SelectTrigger id="year">
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha Desde */}
          <div className="space-y-2">
            <Label>Fecha Desde</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleDateFromChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-2">
            <Label>Fecha Hasta</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP", { locale: es }) : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleDateToChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Propiedad */}
          <div className="space-y-2">
            <Label htmlFor="property">Propiedad</Label>
            <Select
              value={filters.propertyId || "all"}
              onValueChange={handlePropertyChange}
            >
              <SelectTrigger id="property">
                <SelectValue placeholder="Todas las propiedades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las propiedades</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.property_code} - {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Canal */}
          <div className="space-y-2">
            <Label htmlFor="channel">Canal</Label>
            <Select
              value={filters.channelId || "all"}
              onValueChange={handleChannelChange}
            >
              <SelectTrigger id="channel">
                <SelectValue placeholder="Todos los canales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                {channels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comparativa Año Anterior */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="compare"
                checked={filters.compareEnabled || false}
                onCheckedChange={handleCompareToggle}
              />
              <Label htmlFor="compare" className="cursor-pointer">
                Comparar con año anterior
              </Label>
            </div>
            {filters.compareEnabled && (
              <Select
                value={filters.compareYear?.toString() || "none"}
                onValueChange={handleCompareYearChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Año de comparación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Año anterior automático</SelectItem>
                  {availableYears
                    .filter((year) => year !== filters.year)
                    .map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

