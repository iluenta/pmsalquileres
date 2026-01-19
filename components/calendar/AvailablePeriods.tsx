"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Calendar, Loader2, MessageCircle, Share2, ArrowRight } from "lucide-react"
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
  propertyName?: string
}

export function AvailablePeriods({ propertyId, propertyName }: AvailablePeriodsProps) {
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

  const handleWhatsAppShare = (period: AvailablePeriod) => {
    const checkInStr = format(new Date(period.checkIn), "dd/MM")
    const checkOutStr = format(new Date(period.checkOut), "dd/MM")
    const estimatedValue = period.nights * 145 // Simulado

    const message = `¡Hola! Tengo disponibilidad en ${propertyName || 'nuestra propiedad'} del ${checkInStr} al ${checkOutStr} (${period.nights} noches). El precio total estimado es de ${estimatedValue}€. ¿Te gustaría reservarlo?`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analizando disponibilidad...</p>
        </div>
      ) : periods.length > 0 ? (
        <div className="grid gap-4">
          {periods.map((period, index) => {
            const checkInDate = new Date(period.checkIn)
            const checkOutDate = new Date(period.checkOut)
            const estimatedValue = period.nights * 145

            return (
              <Card key={index} className="rounded-2xl border-none shadow-[0_4px_15px_rgb(0,0,0,0.03)] bg-white overflow-hidden group active:scale-[0.98] transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 tracking-tight">
                          {format(checkInDate, "dd MMM", { locale: es }).toUpperCase()} - {format(checkOutDate, "dd MMM", { locale: es }).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                          {period.nights} NOCHES
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Est.</p>
                      <p className="text-lg font-black text-slate-900 leading-tight">{estimatedValue}€</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.2fr,1fr] gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWhatsAppShare(period)}
                      className="rounded-full border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all font-black uppercase text-[10px] tracking-widest h-12 flex items-center justify-center gap-2 px-4 whitespace-nowrap"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>WHATSAPP</span>
                    </Button>
                    <Button
                      size="sm"
                      asChild
                      className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all font-black uppercase text-[10px] tracking-widest h-12 flex items-center justify-center gap-2 px-4 whitespace-nowrap"
                    >
                      <Link
                        href={`/dashboard/bookings/new?propertyId=${propertyId}&checkIn=${format(checkInDate, 'yyyy-MM-dd')}&checkOut=${format(checkOutDate, 'yyyy-MM-dd')}`}
                        className="flex items-center justify-center gap-2"
                      >
                        <span>RESERVAR</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 px-6">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No hay huecos disponibles en los próximos 90 días</p>
        </div>
      )}
    </div>
  )
}
