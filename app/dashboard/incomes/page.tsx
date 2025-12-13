"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { MovementsTable } from "@/components/movements/MovementsTable"
import { MovementsSummary } from "@/components/movements/MovementsSummary"
import type { MovementWithDetails } from "@/types/movements"
import type { ConfigurationValue } from "@/lib/api/configuration"
import { useSeason } from "@/lib/contexts/season-context"

export default function IncomesPage() {
  const { selectedYear } = useSeason()
  const [allMovements, setAllMovements] = useState<MovementWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [movementStatus, setMovementStatus] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [bookingSearch, setBookingSearch] = useState("")
  
  // Datos de configuración
  const [movementTypes, setMovementTypes] = useState<ConfigurationValue[]>([])
  const [movementStatuses, setMovementStatuses] = useState<ConfigurationValue[]>([])
  const [configLoaded, setConfigLoaded] = useState(false)

  // Calcular el tipo de ingreso
  const incomeType = useMemo(() => {
    return movementTypes.find(t => t.value === "income" || t.label === "Ingreso" || t.label?.toLowerCase().includes("ingreso"))
  }, [movementTypes])

  // Determinar el tipo de movimiento activo
  const activeMovementTypeId = useMemo(() => {
    if (incomeType) {
      return incomeType.id
    }
    return null
  }, [incomeType])

  useEffect(() => {
    loadConfigurationData()
  }, [])

  const loadMovements = useCallback(async () => {
    // No cargar si no tenemos el tipo de movimiento activo
    if (!activeMovementTypeId) {
      console.warn("Active movement type ID not available, skipping loadMovements")
      setAllMovements([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Añadir el año del contexto por defecto (solo si no es null)
      if (selectedYear !== null) {
        params.append("year", selectedYear.toString())
      }
      
      // Filtrar por tipo de ingreso - SIEMPRE debe aplicarse
      params.append("movementType", activeMovementTypeId)
      
      if (movementStatus !== "all") {
        params.append("movementStatus", movementStatus)
      }
      
      // Los filtros de fecha desde/hasta son para restringir más el rango
      if (dateFrom) {
        params.append("dateFrom", dateFrom)
      }
      
      if (dateTo) {
        params.append("dateTo", dateTo)
      }
      
      // Búsqueda por reserva
      if (bookingSearch) {
        params.append("bookingSearch", bookingSearch)
      }

      const response = await fetch(`/api/movements?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAllMovements(data)
      } else {
        console.error("Error fetching movements:", response.status, response.statusText)
        setAllMovements([])
      }
    } catch (error) {
      console.error("Error loading movements:", error)
      setAllMovements([])
    } finally {
      setLoading(false)
    }
  }, [activeMovementTypeId, movementStatus, dateFrom, dateTo, bookingSearch, selectedYear])

  useEffect(() => {
    // Solo cargar movimientos si:
    // 1. La configuración está cargada
    // 2. Los tipos están disponibles
    // 3. Podemos determinar el tipo de movimiento activo
    if (configLoaded && movementTypes.length > 0 && activeMovementTypeId) {
      loadMovements()
    } else if (configLoaded) {
      // Si la configuración está cargada pero no podemos cargar movimientos, limpiar
      setAllMovements([])
      setLoading(false)
    }
  }, [configLoaded, movementTypes.length, activeMovementTypeId, loadMovements])

  const loadConfigurationData = async () => {
    try {
      // Limpiar movimientos al iniciar la carga de configuración
      setAllMovements([])
      setLoading(true)
      
      const [typesRes, statusesRes] = await Promise.all([
        fetch("/api/configuration/movement-types"),
        fetch("/api/configuration/movement-statuses"),
      ])

      if (typesRes.ok) {
        const types = await typesRes.json()
        setMovementTypes(types)
      }
      if (statusesRes.ok) {
        setMovementStatuses(await statusesRes.json())
      }
      // Marcar que la configuración está cargada
      setConfigLoaded(true)
    } catch (error) {
      console.error("Error loading configuration:", error)
      setConfigLoaded(true) // Marcar como cargado incluso si hay error para evitar bloqueo
    }
  }

  const handleClearFilters = () => {
    setMovementStatus("all")
    setDateFrom("")
    setDateTo("")
    setBookingSearch("")
  }

  const hasActiveFilters =
    movementStatus !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    bookingSearch !== ""

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ingresos</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestiona los ingresos (pagos de reservas)
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/dashboard/incomes/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ingreso
          </Link>
        </Button>
      </div>

      {/* Filtros y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Filtros */}
        <Card className="lg:col-span-2 h-full flex flex-col">
          <CardContent className="py-3 flex-1 flex flex-col justify-center">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bookingSearch" className="text-xs font-medium">Buscar por Reserva</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      id="bookingSearch"
                      type="text"
                      placeholder="Código, huésped o fecha..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="movementStatus" className="text-xs font-medium">Estado</Label>
                  <Select value={movementStatus} onValueChange={setMovementStatus}>
                    <SelectTrigger id="movementStatus" className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {movementStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dateFrom" className="text-xs font-medium">Fecha Desde</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dateTo" className="text-xs font-medium">Fecha Hasta</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 w-fit text-xs"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumen de ingresos */}
        {!loading && configLoaded && activeMovementTypeId && (
          <div className="lg:col-span-1 h-full">
            <MovementsSummary movements={allMovements} type="income" />
          </div>
        )}
      </div>

      {/* Tabla de ingresos */}
      {loading || !configLoaded || !activeMovementTypeId ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Cargando ingresos...</p>
        </div>
      ) : (
        <MovementsTable movements={allMovements} onMovementDeleted={loadMovements} />
      )}
    </div>
  )
}
