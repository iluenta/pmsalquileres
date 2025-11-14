"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AvailabilityConflict } from "@/lib/api/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface QuickCheckFormProps {
  propertyId: string
  tenantId: string
  onCheck?: (result: { available: boolean; conflicts?: AvailabilityConflict[] }) => void
}

export function QuickCheckForm({ propertyId, tenantId, onCheck }: QuickCheckFormProps) {
  const { toast } = useToast()
  const [checkIn, setCheckIn] = useState("")
  const [nights, setNights] = useState("1")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    available: boolean
    conflicts?: AvailabilityConflict[]
    message?: string
  } | null>(null)

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

    const nightsNum = parseInt(nights) || 1
    if (nightsNum < 1) {
      toast({
        title: "Error",
        description: "El número de noches debe ser al menos 1",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Calcular fecha de salida
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkInDate)
      checkOutDate.setDate(checkOutDate.getDate() + nightsNum)

      const response = await fetch("/api/calendar/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate.toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        onCheck?.(data)
      } else {
        // Intentar parsear el error como JSON
        let errorMessage = "Error al verificar disponibilidad"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // Si no es JSON, usar el status text
          errorMessage = response.statusText || errorMessage
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        
        // Establecer resultado como no disponible
        setResult({
          available: false,
          conflicts: [{
            booking: {} as any,
            conflictType: 'commercial' as const,
            message: errorMessage
          }]
        })
      }
    } catch (error: any) {
      console.error("Error checking availability:", error)
      const errorMessage = error?.message || "Error al verificar disponibilidad"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      // Establecer resultado como no disponible
      setResult({
        available: false,
        conflicts: [{
          booking: {} as any,
          conflictType: 'commercial' as const,
          message: errorMessage
        }]
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 border-border">
      <h3 className="font-semibold text-foreground mb-4">Verificación Rápida</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Verifica si hay disponibilidad para un rango de fechas
      </p>

      <div className="space-y-4">
        {/* Check-in Date */}
        <div className="space-y-2">
          <Label htmlFor="check-in" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fecha de Entrada
          </Label>
          <Input
            id="check-in"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="bg-background border-border"
          />
        </div>

        {/* Number of Nights */}
        <div className="space-y-2">
          <Label htmlFor="nights" className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Número de Noches
          </Label>
          <Input
            id="nights"
            type="number"
            min="1"
            value={nights}
            onChange={(e) => setNights(e.target.value)}
            className="bg-background border-border"
          />
        </div>

        {/* Check Button */}
        <Button
          onClick={handleCheck}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {loading ? "Verificando..." : "Verificar Disponibilidad"}
        </Button>

        {/* Result */}
        {result && (
          <div
            className={`p-3 rounded-md text-sm font-medium ${
              result.available
                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
            }`}
          >
            {result.available ? "✓ Disponible" : "✗ No disponible"}
            {result.conflicts && result.conflicts.length > 0 && (
              <div className="mt-2 space-y-1">
                {result.conflicts.map((conflict, idx) => (
                  <div key={idx} className="text-xs">
                    {conflict.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

