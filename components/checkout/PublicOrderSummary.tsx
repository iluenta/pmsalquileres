import { Card } from '@/components/ui/card'
import { Calendar, Users, Clock } from 'lucide-react'

interface PublicOrderSummaryProps {
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  nights: number
  pricePerNight: number
  totalPrice: number
}

export function PublicOrderSummary({
  checkIn,
  checkOut,
  guests,
  nights,
  pricePerNight,
  totalPrice
}: PublicOrderSummaryProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'No seleccionado'
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Card className="p-6 sticky top-24 border-2 border-slate-900 bg-white">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Resumen de tu Reserva</h3>

      <div className="space-y-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Check-in</span>
          </div>
          <p className="font-semibold text-slate-900">
            {formatDate(checkIn)}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Check-out</span>
          </div>
          <p className="font-semibold text-slate-900">
            {formatDate(checkOut)}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Huéspedes</span>
          </div>
          <p className="font-semibold text-slate-900">{guests} {guests > 1 ? 'personas' : 'persona'}</p>
        </div>
      </div>

      {nights > 0 && (
        <div className="border-t border-slate-100 pt-6 space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>€{pricePerNight} x {nights} noches</span>
            <span className="font-semibold text-slate-900">€{nights * pricePerNight}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Servicio</span>
            <span className="font-semibold text-slate-900">€0</span>
          </div>
        </div>
      )}

      {totalPrice > 0 && (
        <div className="border-t border-slate-100 mt-6 pt-6 flex justify-between items-center text-lg">
          <span className="font-bold text-slate-900 text-base">Total</span>
          <span className="text-2xl font-bold text-teal-700">€{totalPrice}</span>
        </div>
      )}
    </Card>
  )
}

