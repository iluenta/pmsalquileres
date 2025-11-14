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
import { Plus, Search, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { MovementsTable } from "@/components/movements/MovementsTable"
import type { MovementWithDetails } from "@/types/movements"
import type { ConfigurationValue } from "@/lib/api/configuration"

export default function MovementsPage() {
  const [movements, setMovements] = useState<MovementWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [movementType, setMovementType] = useState<string>("all")
  const [movementStatus, setMovementStatus] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  
  // Datos de configuración
  const [movementTypes, setMovementTypes] = useState<ConfigurationValue[]>([])
  const [movementStatuses, setMovementStatuses] = useState<ConfigurationValue[]>([])

  useEffect(() => {
    loadConfigurationData()
  }, [])

  useEffect(() => {
    loadMovements()
  }, [movementType, movementStatus, dateFrom, dateTo])

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
      
      if (movementType !== "all") {
        params.append("movementType", movementType)
      }
      
      if (movementStatus !== "all") {
        params.append("movementStatus", movementStatus)
      }
      
      if (dateFrom) {
        params.append("dateFrom", dateFrom)
      }
      
      if (dateTo) {
        params.append("dateTo", dateTo)
      }

      const response = await fetch(`/api/movements?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMovements(data)
      }
    } catch (error) {
      console.error("Error loading movements:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setMovementType("all")
    setMovementStatus("all")
    setDateFrom("")
    setDateTo("")
  }

  const hasActiveFilters =
    movementType !== "all" ||
    movementStatus !== "all" ||
    dateFrom !== "" ||
    dateTo !== ""

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
                <Label htmlFor="movementType">Tipo</Label>
                <Select value={movementType} onValueChange={setMovementType}>
                  <SelectTrigger id="movementType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {movementTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Tabla de movimientos */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">Cargando movimientos...</p>
        </div>
      ) : (
        <MovementsTable movements={movements} />
      )}
    </div>
  )
}

