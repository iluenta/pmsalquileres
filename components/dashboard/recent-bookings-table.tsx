import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import type { RecentBooking } from "@/lib/api/dashboard"

interface RecentBookingsTableProps {
  bookings: RecentBooking[]
}

export function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-3xl overflow-hidden">
      <CardHeader className="px-6 pt-6 md:px-8 md:pt-8">
        <CardTitle className="text-lg font-black tracking-tighter flex items-center gap-3 text-slate-900 uppercase tracking-[0.1em]">
          <Calendar className="h-5 w-5 text-indigo-600" />
          Reservas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        {bookings.length === 0 ? (
          <p className="text-center text-slate-400 py-12 font-medium">No hay reservas recientes</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all duration-300 group">
                <div className="space-y-1">
                  <p className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">{booking.property_name}</p>
                  <p className="text-xs font-semibold text-slate-500">{booking.guest_name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-base font-black text-slate-900 tracking-tighter">{formatCurrency(booking.total_amount)}</p>
                  <Badge
                    className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border-0"
                    style={{
                      backgroundColor: booking.status_color ? `${booking.status_color}15` : '#f1f5f9',
                      color: booking.status_color || '#64748b',
                    }}
                  >
                    {booking.status_label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
