"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AvailablePeriod {
  checkIn: string
  checkOut: string
  nights: number
}

interface AvailablePeriodsProps {
  propertyId: string
}

export function AvailablePeriods({ propertyId }: AvailablePeriodsProps) {
  const [periods, setPeriods] = useState<AvailablePeriod[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (propertyId) {
      loadAvailablePeriods()
    } else {
      setPeriods([])
    }
  }, [propertyId])

  const loadAvailablePeriods = async () => {
    if (!propertyId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/calendar/next-available?propertyId=${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setPeriods(data)
      } else {
        console.error("Error loading next available periods")
      }
    } catch (error) {
      console.error("Error loading next available periods:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 border-border">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        Próximos Períodos Disponibles
      </h3>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Buscando períodos disponibles...</span>
          </div>
        </div>
      ) : periods.length > 0 ? (
        <div className="space-y-3">
          {periods.map((period, index) => {
            const checkInDate = new Date(period.checkIn)
            const checkOutDate = new Date(period.checkOut)
            const checkInFormatted = format(checkInDate, "d 'de' MMMM yyyy", { locale: es })
            const checkOutFormatted = format(checkOutDate, "d 'de' MMMM yyyy", { locale: es })

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {checkInFormatted} - {checkOutFormatted}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {period.nights} {period.nights === 1 ? 'noche' : 'noches'}
                  </p>
                </div>
                <Button
                  size="sm"
                  asChild
                  className="ml-4 bg-primary hover:bg-primary/90 text-primary-foreground"
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
        <div className="text-center py-8 text-muted-foreground">
          No hay períodos disponibles en los próximos 90 días
        </div>
      )}
    </Card>
  )
}

