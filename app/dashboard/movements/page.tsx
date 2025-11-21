"use client"

import { useState, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { MovementsTable } from "@/components/movements/MovementsTable"
import type { MovementWithDetails } from "@/types/movements"
import type { ConfigurationValue } from "@/lib/api/configuration"
import { useSeason } from "@/lib/contexts/season-context"

export default function MovementsPage() {
  const { selectedYear } = useSeason()
  const [allMovements, setAllMovements] = useState<MovementWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pestaña activa: "income" o "expense"
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income")
  
  // Filtros
  const [movementStatus, setMovementStatus] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [bookingSearch, setBookingSearch] = useState("")
  
  // Datos de configuración
  const [movementTypes, setMovementTypes] = useState<ConfigurationValue[]>([])
  const [movementStatuses, setMovementStatuses] = useState<ConfigurationValue[]>([])

  useEffect(() => {
    loadConfigurationData()
  }, [])

  useEffect(() => {
    loadMovements()
  }, [activeTab, movementStatus, dateFrom, dateTo, bookingSearch, selectedYear])

  const loadConfigurationData = async () => {
    try {
      const [typesRes, statusesRes] = await Promise.all([
        fetch("/api/configuration/movement-types"),
        fetch("/api/configuration/movement-statuses"),
      ])

      if (typesRes.ok) {
        setMovementTypes(await typesRes.json())
      }
      if (statusesRes.ok) {
        setMovementStatuses(await statusesRes.json())
      }
    } catch (error) {
      console.error("Error loading configuration:", error)
    }
  }

  const loadMovements = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      // Añadir el año del contexto por defecto (solo si no es null)
      if (selectedYear !== null) {
        params.append("year", selectedYear.toString())
      }
      
      // Filtrar por tipo según la pestaña activa
      const incomeType = movementTypes.find(t => t.value === "income" || t.label === "Ingreso")
      const expenseType = movementTypes.find(t => t.value === "expense" || t.label === "Gasto")
      
      if (activeTab === "income" && incomeType) {
        params.append("movementType", incomeType.id)
      } else if (activeTab === "expense" && expenseType) {
        params.append("movementType", expenseType.id)
      }
      
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
      }
    } catch (error) {
      console.error("Error loading movements:", error)
    } finally {
      setLoading(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos</h1>
          <p className="text-muted-foreground">
            Gestiona los ingresos (pagos de reservas) y gastos (pagos a proveedores)
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/movements/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filtros</h3>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingSearch">Buscar por Reserva</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bookingSearch"
                    type="text"
                    placeholder="Código, huésped o fecha..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="movementStatus">Estado</Label>
                <Select value={movementStatus} onValueChange={setMovementStatus}>
                  <SelectTrigger id="movementStatus">
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

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Fecha Desde</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Fecha Hasta</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas y Tabla de movimientos */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "income" | "expense")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expense">Gastos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Cargando ingresos...</p>
            </div>
          ) : (
            <MovementsTable movements={allMovements} onMovementDeleted={loadMovements} />
          )}
        </TabsContent>
        
        <TabsContent value="expense" className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Cargando gastos...</p>
            </div>
          ) : (
            <MovementsTable movements={allMovements} onMovementDeleted={loadMovements} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

