"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getYearDateRange, generateMonthRange } from "@/lib/utils/date-helpers"
import type { BookingWithDetails } from "@/types/bookings"

interface OccupancyHeatmapProps {
  bookings: BookingWithDetails[]
  year: number
  propertyId?: string | null
}

export function OccupancyHeatmap({ bookings, year, propertyId }: OccupancyHeatmapProps) {
  const { start, end } = getYearDateRange(year)
  const months = generateMonthRange(start, end)

  // Crear un mapa de fechas ocupadas
  const occupiedDates = new Set<string>()
  bookings.forEach((booking) => {
    if (propertyId && booking.property_id !== propertyId) return
    
    const checkIn = new Date(booking.check_in_date)
    const checkOut = new Date(booking.check_out_date)
    
    const current = new Date(checkIn)
    while (current < checkOut) {
      const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`
      occupiedDates.add(dateKey)
      current.setDate(current.getDate() + 1)
    }
  })

  // Agrupar por mes y día
  const monthData = months.map((monthKey) => {
    const [yearStr, monthStr] = monthKey.split("-")
    const yearNum = parseInt(yearStr)
    const monthNum = parseInt(monthStr)
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate()
    
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dateKey = `${yearStr}-${monthStr}-${String(day).padStart(2, "0")}`
      return {
        day,
        occupied: occupiedDates.has(dateKey),
      }
    })

    const occupiedDays = days.filter((d) => d.occupied).length
    const occupancyRate = (occupiedDays / daysInMonth) * 100

    return {
      month: monthKey,
      monthName: new Date(yearNum, monthNum - 1, 1).toLocaleDateString("es-ES", { month: "short" }),
      days,
      occupiedDays,
      occupancyRate,
    }
  })

  const getIntensity = (rate: number): string => {
    if (rate >= 80) return "bg-green-600"
    if (rate >= 60) return "bg-green-400"
    if (rate >= 40) return "bg-yellow-400"
    if (rate >= 20) return "bg-orange-400"
    return "bg-red-400"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de Ocupación</CardTitle>
        <CardDescription>Heatmap de ocupación por mes y día del año {year}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {monthData.map((month) => (
            <div key={month.month} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{month.monthName}</h4>
                <span className="text-xs text-muted-foreground">
                  {month.occupiedDays}/{month.days.length} días ({month.occupancyRate.toFixed(1)}%)
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {month.days.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded text-xs flex items-center justify-center
                      ${day.occupied ? getIntensity(month.occupancyRate) : "bg-muted"}
                      ${day.occupied ? "text-white" : "text-muted-foreground"}
                    `}
                    title={`${day.day} - ${day.occupied ? "Ocupado" : "Disponible"}`}
                  >
                    {day.day}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600" />
            <span>Alta ocupación (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400" />
            <span>Media ocupación (40-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted" />
            <span>Disponible</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

