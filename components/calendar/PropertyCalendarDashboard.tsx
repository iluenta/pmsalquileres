"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertySelector } from "./PropertySelector"
import { CalendarView } from "./CalendarView"
import { QuickCheckForm } from "./QuickCheckForm"
import { AvailablePeriods } from "./AvailablePeriods"
import { startOfMonth, endOfMonth, addMonths } from "date-fns"
import type { CalendarDay } from "@/lib/api/calendar"
import type { Property } from "@/lib/api/properties"
import { Button } from "@/components/ui/button"
import { Calendar, Search, Building2, LayoutGrid } from "lucide-react"

interface PropertyCalendarDashboardProps {
  properties: Property[]
  tenantId: string
}

export function PropertyCalendarDashboard({ properties, tenantId }: PropertyCalendarDashboardProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")
  const [currentMonth, setCurrentMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [days, setDays] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      const firstActiveProperty = properties.find(p => p.is_active) || properties[0]
      if (firstActiveProperty?.id) {
        setSelectedPropertyId(firstActiveProperty.id)
      }
    }
  }, [properties.length, selectedPropertyId])

  useEffect(() => {
    if (!selectedPropertyId) {
      setDays([])
      return
    }

    const loadAvailability = async () => {
      setLoading(true)
      try {
        const monthDate = currentMonth instanceof Date ? currentMonth : new Date(currentMonth)

        // Cargar 3 meses para el Yield Management Dashboard
        const startDate = startOfMonth(monthDate)
        const endDate = endOfMonth(addMonths(monthDate, 2))

        const response = await fetch(
          `/api/calendar/availability?propertyId=${selectedPropertyId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        )

        if (response.ok) {
          const data = await response.json()
          setDays(data)
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
      window.location.href = `/dashboard/bookings/${day.booking.id}`
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* 1. FIXED HEADER Area - Optimized for Pro Users */}
      <div className="px-6 pt-6 pb-5 shrink-0 bg-white border-b border-slate-200 shadow-sm z-30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between w-full">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <LayoutGrid className="w-7 h-7 text-indigo-600" />
              Yield Management Dashboard
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              Control de Ingresos, Disponibilidad y Restricciones
            </p>
          </div>

          <PropertySelector
            selectedProperty={selectedPropertyId}
            onPropertyChange={(id) => {
              setSelectedPropertyId(id)
              setCurrentMonth(startOfMonth(new Date()))
            }}
            properties={properties}
            compact={true}
          />
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      {selectedPropertyId ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* 3. SCROLLABLE CONTENT Area - Expanded for data density */}
          <div className="flex-1 overflow-y-auto px-4 py-8 min-h-0 scrollbar-hide bg-[#F8FAFC]">
            <div className="w-full max-w-full pb-20">
              {currentMonth && (
                <CalendarView
                  propertyId={selectedPropertyId}
                  currentMonth={currentMonth}
                  onMonthChange={(date) => setCurrentMonth(startOfMonth(date))}
                  days={days}
                  onDayClick={handleDayClick}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 flex-1 flex items-center justify-center">
          <Card className="rounded-[3rem] border-none shadow-[0_20px_50px_rgb(0,0,0,0.06)] bg-white p-24 text-center max-w-3xl">
            <div className="flex flex-col items-center gap-8">
              <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                <Building2 className="w-12 h-12 text-slate-300" />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Potencia tu Estrategia de Precios</h2>
                <p className="text-slate-400 font-bold max-w-md mx-auto uppercase text-[11px] tracking-widest leading-relaxed">
                  Selecciona una propiedad para acceder al panel de control de ingresos y optimizar tu rentabilidad por noche.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
