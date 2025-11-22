"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, addMonths, subDays, addDays } from "date-fns"
import { es } from "date-fns/locale"
import type { BookingWithDetails } from "@/types/bookings"
import { BookingsFilters, type BookingsFiltersState } from "./BookingsFilters"
import { BookingCard } from "./BookingCard"
import type { Property } from "@/lib/api/properties"
import type { ConfigurationValue } from "@/lib/api/configuration"

interface BookingsTableProps {
  bookings: BookingWithDetails[]
  properties: Property[]
  bookingStatuses: ConfigurationValue[]
  bookingTypes: ConfigurationValue[]
  onBookingDeleted?: () => void
}

const ITEMS_PER_PAGE = 5

export function BookingsTable({ bookings, properties, bookingStatuses, bookingTypes, onBookingDeleted }: BookingsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<BookingsFiltersState>({
    propertyId: "all",
    guestName: "",
    phone: "",
    statusId: "all",
    bookingTypeId: "all",
    dateRange: "all",
  })

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

      // Cerrar el diálogo primero
      setDeleteId(null)
      
      // Mostrar mensaje de éxito
      toast({
        title: "Reserva eliminada",
        description: "La reserva se ha eliminado correctamente.",
        duration: 3000,
      })

      // Actualizar la lista de reservas
      if (onBookingDeleted) {
        onBookingDeleted()
      } else {
        // Fallback: refrescar la página si no hay callback
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

  // Función para obtener el rango de fechas según el filtro temporal
  const getDateRange = (range: string): { start: Date | null; end: Date | null } => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (range) {
      case "next7days": {
        const end = addDays(today, 7)
        return { start: today, end }
      }
      case "thisMonth": {
        const start = startOfMonth(today)
        const end = endOfMonth(today)
        return { start, end }
      }
      case "nextMonth": {
        const nextMonth = addMonths(today, 1)
        const start = startOfMonth(nextMonth)
        const end = endOfMonth(nextMonth)
        return { start, end }
      }
      case "last7days": {
        const start = subDays(today, 7)
        return { start, end: today }
      }
      case "lastMonth": {
        const lastMonth = addMonths(today, -1)
        const start = startOfMonth(lastMonth)
        const end = endOfMonth(lastMonth)
        return { start, end }
      }
      default:
        return { start: null, end: null }
    }
  }

  // Filtrar reservas según los filtros aplicados
  const filteredBookings = useMemo(() => {
    let result = [...bookings]

    // Filtro por propiedad
    if (filters.propertyId && filters.propertyId !== "all") {
      result = result.filter((booking) => booking.property?.id === filters.propertyId)
    }

    // Filtro por nombre del huésped
    if (filters.guestName) {
      const searchTerm = filters.guestName.toLowerCase()
      result = result.filter((booking) => {
        if (!booking.person) return false
        const fullName = `${booking.person.first_name} ${booking.person.last_name}`.toLowerCase()
        return fullName.includes(searchTerm)
      })
    }

    // Filtro por teléfono
    if (filters.phone) {
      const searchTerm = filters.phone
      result = result.filter((booking) => {
        if (!booking.person?.phone) return false
        return booking.person.phone.includes(searchTerm)
      })
    }

    // Filtro por estado
    if (filters.statusId && filters.statusId !== "all") {
      result = result.filter((booking) => booking.booking_status?.id === filters.statusId)
    }

    // Filtro por tipo de reserva
    if (filters.bookingTypeId && filters.bookingTypeId !== "all") {
      result = result.filter((booking) => booking.booking_type?.id === filters.bookingTypeId)
    }

    // Filtro temporal
    if (filters.dateRange !== "all") {
      const { start, end } = getDateRange(filters.dateRange)
      if (start && end) {
        result = result.filter((booking) => {
          const checkInDate = new Date(booking.check_in_date)
          checkInDate.setHours(0, 0, 0, 0)
          return checkInDate >= start && checkInDate <= end
        })
      }
    }

    return result
  }, [bookings, filters])

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Calcular paginación solo para vista de escritorio
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredBookings.slice(startIndex, endIndex)
  }, [filteredBookings, currentPage])

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)
  const startItem = filteredBookings.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)

  if (bookings.length === 0) {
    return (
      <div className="space-y-4">
        <BookingsFilters
          properties={properties}
          bookingStatuses={bookingStatuses}
          bookingTypes={bookingTypes}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <div className="text-center py-12">
          <p className="text-gray-500">No hay reservas registradas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <BookingsFilters
        properties={properties}
        bookingStatuses={bookingStatuses}
        bookingTypes={bookingTypes}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Mostrando {filteredBookings.length} de {bookings.length} reserva{bookings.length !== 1 ? "s" : ""}
          {filteredBookings.length > 0 && (
            <span className="hidden md:inline">
              {" "}(Página {currentPage} de {totalPages})
            </span>
          )}
        </p>
      </div>

      {/* Vista de tarjetas para móvil */}
      <div className="block md:hidden space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 rounded-md border">
            <p className="text-gray-500">No se encontraron reservas con los filtros aplicados</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onDelete={onBookingDeleted}
            />
          ))
        )}
      </div>

      {/* Vista de tabla para escritorio */}
      <div className="hidden md:block rounded-md border">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Propiedad</TableHead>
            <TableHead>Huésped</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fechas</TableHead>
            <TableHead>Huéspedes</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
                <p className="text-gray-500">No se encontraron reservas con los filtros aplicados</p>
              </TableCell>
            </TableRow>
          ) : (
            paginatedBookings.map((booking) => (
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
                    {booking.person.phone && (
                      <div className="text-sm text-gray-500">
                        {booking.person.phone}
                      </div>
                    )}
                    {booking.channel && (
                      <div className="text-xs text-blue-600 mt-1">
                        {booking.channel.person.full_name}
                      </div>
                    )}
                  </div>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                {booking.booking_type ? (
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
                ) : (
                  <Badge variant="outline">Sin tipo</Badge>
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
                  {booking.pending_amount !== undefined && booking.pending_amount > 0 && (
                    <div className="text-sm text-orange-600 font-medium">
                      Pendiente: {formatCurrency(booking.pending_amount)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
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
                  {booking.pending_amount !== undefined && (
                    <div>
                      {booking.pending_amount === 0 ? (
                        <Badge variant="default" className="bg-green-600">
                          Pagado
                        </Badge>
                      ) : booking.paid_amount > 0 ? (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Parcial
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
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
              </TableCell>
            </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      {/* Controles de paginación (solo escritorio) */}
      {filteredBookings.length > ITEMS_PER_PAGE && (
        <div className="hidden md:flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {startItem}-{endItem} de {filteredBookings.length} reserva{filteredBookings.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

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
              Esta acción no se puede deshacer. Se eliminará permanentemente la reserva
              {deleteId && bookings.find(b => b.id === deleteId) && (
                <> <strong>{bookings.find(b => b.id === deleteId)?.booking_code}</strong></>
              )}.
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
    </div>
  )
}

