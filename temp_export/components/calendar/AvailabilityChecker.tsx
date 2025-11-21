"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Calendar as CalendarIcon } from "lucide-react"
import type { AvailabilityConflict } from "@/lib/api/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface AvailabilityCheckerProps {
  propertyId: string
  tenantId: string
}

interface AvailablePeriod {
  checkIn: string
  checkOut: string
  nights: number
}

export function AvailabilityChecker({ propertyId, tenantId }: AvailabilityCheckerProps) {
  const { toast } = useToast()
  const [mode, setMode] = useState<"nights" | "dates">("nights")
  const [checkIn, setCheckIn] = useState("")
  const [nights, setNights] = useState(1)
  const [checkOut, setCheckOut] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    available: boolean
    conflicts?: AvailabilityConflict[]
    message?: string
  } | null>(null)
  const [nextPeriods, setNextPeriods] = useState<AvailablePeriod[]>([])
  const [loadingPeriods, setLoadingPeriods] = useState(false)

  // Cargar próximos periodos disponibles cuando cambia la propiedad
  useEffect(() => {
    if (propertyId) {
      loadNextAvailablePeriods()
    } else {
      setNextPeriods([])
    }
  }, [propertyId])

  const loadNextAvailablePeriods = async () => {
    if (!propertyId) return

    setLoadingPeriods(true)
    try {
      const response = await fetch(`/api/calendar/next-available?propertyId=${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setNextPeriods(data)
      } else {
        console.error("Error loading next available periods")
      }
    } catch (error) {
      console.error("Error loading next available periods:", error)
    } finally {
      setLoadingPeriods(false)
    }
  }

  const handleCheck = async () => {
    if (!propertyId) {
      toast({
        title: "Error",
        description: "Debe seleccionar una propiedad",
        variant: "destructive",
      })
      return
    }

    if (!checkIn) {
      toast({
        title: "Error",
        description: "Debe ingresar una fecha de entrada",
        variant: "destructive",
      })
      return
    }

    let finalCheckOut = checkOut

    if (mode === "nights") {
      if (nights < 1) {
        toast({
          title: "Error",
          description: "El número de noches debe ser al menos 1",
          variant: "destructive",
        })
        return
      }

      // Calcular fecha de salida
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkInDate)
      checkOutDate.setDate(checkOutDate.getDate() + nights)
      finalCheckOut = checkOutDate.toISOString().split('T')[0]
    } else {
      if (!checkOut) {
        toast({
          title: "Error",
          description: "Debe ingresar una fecha de salida",
          variant: "destructive",
        })
        return
      }

      if (new Date(checkOut) <= new Date(checkIn)) {
        toast({
          title: "Error",
          description: "La fecha de salida debe ser posterior a la fecha de entrada",
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/calendar/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          checkIn,
          checkOut: finalCheckOut
        })
      })

      if (response.ok) {
        const validationResult = await response.json()
        setResult(validationResult)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al verificar disponibilidad",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Error al verificar disponibilidad",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificación Rápida de Disponibilidad</CardTitle>
        <CardDescription>
          Verifica si hay disponibilidad para un rango de fechas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={mode === "nights" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("nights")}
          >
            Por Noches
          </Button>
          <Button
            variant={mode === "dates" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("dates")}
          >
            Por Fechas
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="check-in">Fecha de Entrada</Label>
            <Input
              id="check-in"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          {mode === "nights" ? (
            <div className="space-y-2">
              <Label htmlFor="nights">Número de Noches</Label>
              <Input
                id="nights"
                type="number"
                min="1"
                value={nights}
                onChange={(e) => setNights(parseInt(e.target.value) || 1)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="check-out">Fecha de Salida</Label>
              <Input
                id="check-out"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn}
              />
            </div>
          )}

          <Button
            onClick={handleCheck}
            disabled={loading || !propertyId}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar Disponibilidad"
            )}
          </Button>
        </div>

        {result && (
          <div className={cn(
            "p-4 rounded-lg border",
            result.available
              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
              : result.conflicts?.some(c => c.conflictType === 'closed_period')
              ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
              : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
          )}>
            <div className="flex items-start gap-3">
              {result.available ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : result.conflicts?.some(c => c.conflictType === 'closed_period') ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={cn(
                  "font-medium",
                  result.available
                    ? "text-green-800 dark:text-green-200"
                    : result.conflicts?.some(c => c.conflictType === 'closed_period')
                    ? "text-yellow-800 dark:text-yellow-200"
                    : "text-red-800 dark:text-red-200"
                )}>
                  {result.available
                    ? "Disponible"
                    : result.conflicts?.some(c => c.conflictType === 'closed_period')
                    ? "Período Cerrado"
                    : "No Disponible"}
                </p>
                {result.message && (
                  <p className="text-sm mt-1 opacity-90">
                    {result.message}
                  </p>
                )}
                {result.conflicts && result.conflicts.length > 0 && (
                  <ul className="text-sm mt-2 space-y-1">
                    {result.conflicts.map((conflict, index) => (
                      <li key={index} className="opacity-90">
                        • {conflict.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Próximos periodos disponibles */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Próximos Periodos Disponibles</h3>
          </div>
          
          {loadingPeriods ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Buscando periodos disponibles...</span>
            </div>
          ) : nextPeriods.length > 0 ? (
            <div className="space-y-2">
              {nextPeriods.map((period, index) => {
                const checkInDate = new Date(period.checkIn)
                const checkOutDate = new Date(period.checkOut)
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          {format(checkInDate, "d 'de' MMMM", { locale: es })} - {format(checkOutDate, "d 'de' MMMM yyyy", { locale: es })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">
                        {period.nights} {period.nights === 1 ? 'noche' : 'noches'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="ml-2"
                    >
                      <Link
                        href={`/dashboard/bookings/new?propertyId=${propertyId}&checkIn=${format(checkInDate, 'yyyy-MM-dd')}&checkOut=${format(checkOutDate, 'yyyy-MM-dd')}`}
                      >
                        Reservar
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No se encontraron periodos disponibles en los próximos 365 días
            </p>
          )}
          
          {nextPeriods.length > 0 && nextPeriods.length < 4 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Se encontraron {nextPeriods.length} {nextPeriods.length === 1 ? 'periodo' : 'periodos'} disponible{nextPeriods.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

