"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { BookingWithDetails } from "@/types/bookings"

interface BookingsTableProps {
  bookings: BookingWithDetails[]
  onDelete?: (id: string) => Promise<void>
}

export function BookingsTable({ bookings, onDelete }: BookingsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
      return
    }

    if (onDelete) {
      setDeletingId(id)
      try {
        await onDelete(id)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay reservas registradas</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Propiedad</TableHead>
            <TableHead>Huésped</TableHead>
            <TableHead>Fechas</TableHead>
            <TableHead>Huéspedes</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.booking_code}</TableCell>
              <TableCell>
                {booking.property ? (
                  <div>
                    <div className="font-medium">{booking.property.name}</div>
                    <div className="text-sm text-gray-500">
                      {booking.property.property_code}
                    </div>
                  </div>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                {booking.person ? (
                  <div>
                    <div className="font-medium">
                      {booking.person.first_name} {booking.person.last_name}
                    </div>
                    {booking.person.email && (
                      <div className="text-sm text-gray-500">
                        {booking.person.email}
                      </div>
                    )}
                  </div>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>Entrada: {formatDate(booking.check_in_date)}</div>
                  <div>Salida: {formatDate(booking.check_out_date)}</div>
                </div>
              </TableCell>
              <TableCell>{booking.number_of_guests}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{formatCurrency(booking.total_amount)}</div>
                  {booking.paid_amount > 0 && (
                    <div className="text-sm text-gray-500">
                      Pagado: {formatCurrency(booking.paid_amount)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {booking.booking_status ? (
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: booking.booking_status.color
                        ? `${booking.booking_status.color}20`
                        : undefined,
                      borderColor: booking.booking_status.color || undefined,
                      color: booking.booking_status.color || undefined,
                    }}
                  >
                    {booking.booking_status.label}
                  </Badge>
                ) : (
                  <Badge variant="outline">Sin estado</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/bookings/${booking.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/bookings/${booking.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => handleDelete(booking.id)}
                        disabled={deletingId === booking.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === booking.id ? "Eliminando..." : "Eliminar"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

