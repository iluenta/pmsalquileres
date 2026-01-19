"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Users, Moon, Search, Loader2, CheckCircle2, XCircle, MessageCircle, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AvailabilityConflict } from "@/lib/api/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface QuickCheckFormProps {
  propertyId: string
  tenantId: string
  onCheck?: (result: { available: boolean; conflicts?: AvailabilityConflict[] }) => void
}

export function QuickCheckForm({ propertyId, tenantId, onCheck }: QuickCheckFormProps) {
  const { toast } = useToast()
  const [checkIn, setCheckIn] = useState("")
  const [nights, setNights] = useState("1")
  const [pax, setPax] = useState("2")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    available: boolean
    conflicts?: AvailabilityConflict[]
    message?: string
  } | null>(null)

  const handleWhatsAppShare = () => {
    if (!result || !checkIn) return

    const checkInDate = new Date(checkIn)
    const nightsNum = parseInt(nights) || 1
    const checkOutDate = new Date(checkInDate)
    checkOutDate.setDate(checkOutDate.getDate() + nightsNum)

    const checkInStr = format(checkInDate, "dd/MM")
    const checkOutStr = format(checkOutDate, "dd/MM")
    const guestsTotal = parseInt(pax) || 2

    // El precio es opcional o simulado por ahora
    const message = `¡Hola! He consultado disponibilidad para del ${checkInStr} al ${checkOutStr} (${nightsNum} noches) para ${guestsTotal} personas y está DISPONIBLE. ¿Te gustaría reservarlo?`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCheck = async () => {
    if (!propertyId) {
      toast({ title: "Error", description: "Debe seleccionar una propiedad", variant: "destructive" })
      return
    }

    if (!checkIn) {
      toast({ title: "Error", description: "Debe ingresar una fecha de entrada", variant: "destructive" })
      return
    }

    const nightsNum = parseInt(nights) || 1
    if (nightsNum < 1) {
      toast({ title: "Error", description: "El número de noches debe ser al menos 1", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
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
          pax: parseInt(pax)
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        onCheck?.(data)
      } else {
        let errorMessage = "Error al verificar disponibilidad"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }

        toast({ title: "Error", description: errorMessage, variant: "destructive" })
        setResult({
          available: false,
          conflicts: [{ booking: {} as any, conflictType: 'commercial' as const, message: errorMessage }]
        })
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Error al verificar disponibilidad"
      setResult({
        available: false,
        conflicts: [{ booking: {} as any, conflictType: 'commercial' as const, message: errorMessage }]
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white overflow-hidden">
      <div className="bg-slate-50/30 px-10 py-6 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <Search className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">Verificación Rápida</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Consulta de disponibilidad manual</p>
        </div>
      </div>
      <CardContent className="p-10 space-y-8">
        <div className="space-y-3">
          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha de Entrada</Label>
          <div className="relative">
            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg pl-14"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Noches</Label>
            <div className="relative">
              <Moon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input
                type="number"
                min="1"
                value={nights}
                onChange={(e) => setNights(e.target.value)}
                className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg pl-14"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Huéspedes</Label>
            <div className="relative">
              <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input
                type="number"
                min="1"
                value={pax}
                onChange={(e) => setPax(e.target.value)}
                className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg pl-14"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleCheck}
          disabled={loading}
          className="w-full h-16 rounded-full font-black uppercase text-sm tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3 px-8"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>VERIFICANDO...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>VERIFICAR DISPONIBILIDAD</span>
            </>
          )}
        </Button>

        {result && (
          <div
            className={`p-6 rounded-[1.5rem] border animate-in fade-in zoom-in-95 duration-300 ${result.available
              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
              : "bg-rose-50 border-rose-100 text-rose-700"
              }`}
          >
            <div className={`flex items-start gap-4 ${result.available ? "text-emerald-700" : "text-rose-700"}`}>
              {result.available ? (
                <div className="h-7 w-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              ) : (
                <div className="h-7 w-7 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-base font-black uppercase tracking-tighter leading-tight">
                  {result.available ? "Disponible" : "No Disponible"}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">
                  {result.available ? "para reserva" : "revisar conflictos"}
                </span>
              </div>
            </div>

            {!result.available && result.conflicts && result.conflicts.length > 0 && (
              <div className="space-y-1 mt-3 pt-3 border-t border-rose-100/50">
                {result.conflicts.map((conflict, idx) => (
                  <p key={idx} className="text-xs font-bold leading-relaxed">
                    • {conflict.message}
                  </p>
                ))}
              </div>
            )}

            {result.available && (
              <div className="grid grid-cols-[1.2fr,1fr] gap-3 mt-6 pt-6 border-t border-emerald-100/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppShare}
                  className="rounded-full border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 transition-all font-black uppercase text-[10px] tracking-widest h-12 flex items-center justify-center gap-2 px-4 whitespace-nowrap overflow-hidden"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>WHATSAPP</span>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100 transition-all font-black uppercase text-[10px] tracking-widest h-12 flex items-center justify-center gap-2 px-4 whitespace-nowrap overflow-hidden"
                >
                  <Link
                    href={`/dashboard/bookings/new?propertyId=${propertyId}&checkIn=${checkIn}&nights=${nights}&pax=${pax}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>RESERVAR</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
