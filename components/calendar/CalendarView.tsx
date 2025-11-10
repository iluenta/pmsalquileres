"use client"

import { useState, useEffect } from "react"
import { addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { MonthCalendar } from "./MonthCalendar"
import { AvailabilityChecker } from "./AvailabilityChecker"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Calendar, Search } from "lucide-react"
import type { CalendarDay } from "@/lib/api/calendar"
import type { Property } from "@/lib/api/properties"

interface CalendarViewProps {
  properties: Property[]
  tenantId: string
}

export function CalendarView({ properties, tenantId }: CalendarViewProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")
  const [currentMonth1, setCurrentMonth1] = useState(startOfMonth(new Date()))
  const [currentMonth2, setCurrentMonth2] = useState(startOfMonth(addMonths(new Date(), 1)))
  const [days, setDays] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar disponibilidad cuando cambia la propiedad o los meses
  useEffect(() => {
    if (!selectedPropertyId) {
      setDays([])
      return
    }

    const loadAvailability = async () => {
      setLoading(true)
      try {
        const startDate = currentMonth1 < currentMonth2 ? currentMonth1 : currentMonth2
        const endDate = currentMonth1 < currentMonth2 
          ? endOfMonth(currentMonth2) 
          : endOfMonth(currentMonth1)

        const response = await fetch(
          `/api/calendar/availability?propertyId=${selectedPropertyId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        )

        if (response.ok) {
          const data = await response.json()
          setDays(data)
        } else {
          console.error("Error loading availability")
        }
      } catch (error) {
        console.error("Error loading availability:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAvailability()
  }, [selectedPropertyId, currentMonth1, currentMonth2])

  const handlePreviousMonth = () => {
    setCurrentMonth1(subMonths(currentMonth1, 1))
    setCurrentMonth2(subMonths(currentMonth2, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth1(addMonths(currentMonth1, 1))
    setCurrentMonth2(addMonths(currentMonth2, 1))
  }

  const handleDayClick = (day: CalendarDay) => {
    if (day.booking) {
      // Navegar a la vista de reserva
      window.location.href = `/dashboard/bookings/${day.booking.id}`
    }
  }

  // Filtrar días para cada mes
  const daysMonth1 = days.filter(day => {
    const dayMonth = new Date(day.date).getMonth()
    const dayYear = new Date(day.date).getFullYear()
    return dayMonth === currentMonth1.getMonth() && dayYear === currentMonth1.getFullYear()
  })

  const daysMonth2 = days.filter(day => {
    const dayMonth = new Date(day.date).getMonth()
    const dayYear = new Date(day.date).getFullYear()
    return dayMonth === currentMonth2.getMonth() && dayYear === currentMonth2.getFullYear()
  })

  return (
    <div className="space-y-6">
      {/* Selector de propiedad - Siempre visible */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Propiedad</label>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una propiedad" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.property_code} - {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedPropertyId ? (
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Verificación Rápida
            </TabsTrigger>
          </TabsList>

          {/* Pestaña: Calendario */}
          <TabsContent value="calendar" className="space-y-4 mt-6">
            {/* Navegación de meses */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Mes Anterior
              </Button>
              <Button variant="outline" onClick={handleNextMonth}>
                Mes Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Dos meses lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Cargando disponibilidad...</span>
                  </div>
                </div>
              ) : (
                <>
                  <MonthCalendar
                    month={currentMonth1}
                    days={daysMonth1}
                    onDayClick={handleDayClick}
                  />
                  <MonthCalendar
                    month={currentMonth2}
                    days={daysMonth2}
                    onDayClick={handleDayClick}
                  />
                </>
              )}
            </div>

            {/* Leyenda */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800" />
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800" />
                    <span>Reserva Comercial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800" />
                    <span>Período Cerrado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña: Verificación Rápida */}
          <TabsContent value="availability" className="mt-6">
            <AvailabilityChecker propertyId={selectedPropertyId} tenantId={tenantId} />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Seleccione una propiedad para ver el calendario de disponibilidad
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

