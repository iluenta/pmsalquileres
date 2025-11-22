"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardAction,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, Users, Home, Phone, Mail } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { BookingWithDetails } from "@/types/bookings"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface BookingCardProps {
  booking: BookingWithDetails
  onDelete?: () => void
}

export function BookingCard({ booking, onDelete }: BookingCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al eliminar la reserva")
      }

      setDeleteId(null)
      
      toast({
        title: "Reserva eliminada",
        description: "La reserva se ha eliminado correctamente.",
        duration: 3000,
      })

      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "No se pudo eliminar la reserva",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold">
                {booking.booking_code}
              </CardTitle>
              {booking.property && (
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Home className="h-3 w-3" />
                  <span>{booking.property.name}</span>
                  {booking.property.property_code && (
                    <span className="text-xs">({booking.property.property_code})</span>
                  )}
                </div>
              )}
            </div>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Acciones</span>
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
                  <DropdownMenuItem
                    onClick={() => setDeleteId(booking.id)}
                    disabled={deletingId === booking.id}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === booking.id ? "Eliminando..." : "Eliminar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Huésped */}
          {booking.person ? (
            <div className="space-y-1">
              <div className="font-medium text-sm">
                {booking.person.first_name} {booking.person.last_name}
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {booking.person.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{booking.person.phone}</span>
                  </div>
                )}
                {booking.person.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{booking.person.email}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Sin huésped asignado</div>
          )}

          {/* Canal */}
          {booking.channel && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Canal: </span>
              {booking.channel.person.full_name}
            </div>
          )}

          {/* Fechas */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div>
                <span className="font-medium">Entrada: </span>
                {formatDate(booking.check_in_date)}
              </div>
              <div>
                <span className="font-medium">Salida: </span>
                {formatDate(booking.check_out_date)}
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div className="flex flex-wrap items-center gap-2">
            {booking.booking_type && (
              <Badge
                variant="outline"
                style={{
                  backgroundColor: booking.booking_type.color
                    ? `${booking.booking_type.color}20`
                    : undefined,
                  borderColor: booking.booking_type.color || undefined,
                  color: booking.booking_type.color || undefined,
                }}
              >
                {booking.booking_type.label}
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{booking.number_of_guests} huésped{booking.number_of_guests !== 1 ? "es" : ""}</span>
            </div>
          </div>

          {/* Estados */}
          <div className="flex flex-wrap items-center gap-2">
            {booking.booking_status && (
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
            )}
            {booking.pending_amount !== undefined && (
              <Badge
                variant={
                  booking.pending_amount === 0
                    ? "default"
                    : booking.paid_amount > 0
                    ? "secondary"
                    : "destructive"
                }
                className={
                  booking.pending_amount === 0
                    ? "bg-green-600"
                    : booking.paid_amount > 0
                    ? "bg-orange-100 text-orange-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {booking.pending_amount === 0
                  ? "Pagado"
                  : booking.paid_amount > 0
                  ? "Parcial"
                  : "Pendiente"}
              </Badge>
            )}
          </div>

          {/* Importes */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total:</span>
              <span className="text-lg font-bold">{formatCurrency(booking.total_amount)}</span>
            </div>
            {booking.paid_amount > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Pagado:</span>
                <span>{formatCurrency(booking.paid_amount)}</span>
              </div>
            )}
            {booking.pending_amount !== undefined && booking.pending_amount > 0 && (
              <div className="flex items-center justify-between text-sm font-medium text-orange-600">
                <span>Pendiente:</span>
                <span>{formatCurrency(booking.pending_amount)}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-0">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dashboard/bookings/${booking.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dashboard/bookings/${booking.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => {
        if (!open && !deletingId) {
          setDeleteId(null)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la reserva{" "}
              <strong>{booking.booking_code}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={!!deletingId}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {deletingId ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

