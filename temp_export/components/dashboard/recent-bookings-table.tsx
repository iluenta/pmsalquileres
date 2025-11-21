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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Reservas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay reservas recientes</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="space-y-1">
                  <p className="font-medium">{booking.property_name}</p>
                  <p className="text-sm text-muted-foreground">{booking.guest_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <p className="font-semibold">{formatCurrency(booking.total_amount)}</p>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: `${booking.status_color}20`,
                      color: booking.status_color,
                      borderColor: booking.status_color,
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
