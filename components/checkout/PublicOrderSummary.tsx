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
  return (
    <Card className="p-6 sticky top-4 border-2 border-primary bg-gradient-to-b from-white to-primary/5">
      <h3 className="font-serif text-xl font-bold mb-6">Resumen de tu Reserva</h3>

      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Check-in</span>
          </div>
          <p className="font-semibold">
            {checkIn?.toLocaleDateString('es-ES', { 
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) || 'No seleccionado'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Check-out</span>
          </div>
          <p className="font-semibold">
            {checkOut?.toLocaleDateString('es-ES', { 
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) || 'No seleccionado'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Huéspedes</span>
          </div>
          <p className="font-semibold">{guests} {guests > 1 ? 'personas' : 'persona'}</p>
        </div>
      </div>

      {nights > 0 && (
        <div className="border-t border-neutral-300 pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">${pricePerNight} x {nights} noches</span>
            <span className="font-semibold">${nights * pricePerNight}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Servicio</span>
            <span className="font-semibold">$0</span>
          </div>
        </div>
      )}

      {totalPrice > 0 && (
        <div className="border-t border-neutral-300 mt-4 pt-4 flex justify-between items-center">
          <span className="font-bold">Total</span>
          <span className="font-serif text-3xl font-bold text-primary">${totalPrice}</span>
        </div>
      )}
    </Card>
  )
}

