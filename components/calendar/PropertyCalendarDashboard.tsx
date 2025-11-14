"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertySelector } from "./PropertySelector"
import { CalendarView } from "./CalendarView"
import { QuickCheckForm } from "./QuickCheckForm"
import { AvailablePeriods } from "./AvailablePeriods"
import { addMonths, startOfMonth, endOfMonth } from "date-fns"
import type { CalendarDay } from "@/lib/api/calendar"
import type { Property } from "@/lib/api/properties"

interface PropertyCalendarDashboardProps {
  properties: Property[]
  tenantId: string
}

export function PropertyCalendarDashboard({ properties, tenantId }: PropertyCalendarDashboardProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [days, setDays] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(false)

  // Cargar disponibilidad cuando cambia la propiedad o el mes
  useEffect(() => {
    if (!selectedPropertyId) {
      setDays([])
      return
    }

    const loadAvailability = async () => {
      setLoading(true)
      try {
        // Asegurar que currentMonth es un Date válido
        const monthDate = currentMonth instanceof Date ? currentMonth : new Date(currentMonth)
        
        // Cargar 3 meses: mes actual + 2 siguientes
        const startDate = startOfMonth(monthDate)
        const endDate = endOfMonth(addMonths(monthDate, 2))

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
  }, [selectedPropertyId, currentMonth])

  const handleDayClick = (day: CalendarDay) => {
    if (day.booking) {
      // Navegar a la vista de reserva
      window.location.href = `/dashboard/bookings/${day.booking.id}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Property Selector */}
      <PropertySelector 
        selectedProperty={selectedPropertyId}
        onPropertyChange={setSelectedPropertyId}
        properties={properties}
      />

      {selectedPropertyId ? (
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto">
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="quick-check">Verificación Rápida</TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4 mt-6">
            {currentMonth && (
              <CalendarView 
                propertyId={selectedPropertyId}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                days={days}
                onDayClick={handleDayClick}
                loading={loading}
              />
            )}
          </TabsContent>

          {/* Quick Check Tab */}
          <TabsContent value="quick-check" className="space-y-4 mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <QuickCheckForm propertyId={selectedPropertyId} tenantId={tenantId} />
              </div>
              <div className="lg:col-span-2">
                <AvailablePeriods propertyId={selectedPropertyId} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <div className="p-6">
            <p className="text-center text-muted-foreground">
              Seleccione una propiedad para ver el calendario de disponibilidad
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

