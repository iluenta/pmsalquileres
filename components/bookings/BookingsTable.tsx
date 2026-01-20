"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
import { MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Users, Phone } from "lucide-react"
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

const ITEMS_PER_PAGE = 6

export function BookingsTable({ bookings, properties, bookingStatuses, bookingTypes, onBookingDeleted }: BookingsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<BookingsFiltersState>({
    propertyId: "all",
    search: "",
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

    // Búsqueda Global (Nombre, Teléfono, Email, Localizador)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      result = result.filter((booking) => {
        const guestName = booking.person ? `${booking.person.first_name} ${booking.person.last_name}`.toLowerCase() : ""
        const phone = booking.person?.phone || ""
        const email = booking.person?.email?.toLowerCase() || ""
        const code = booking.booking_code?.toLowerCase() || ""

        return (
          guestName.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          email.includes(searchTerm) ||
          code.includes(searchTerm)
        )
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

      {/* Vista de tabla para escritorio - B2B High Density Card */}
      <div className="hidden md:block bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-200">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3 pl-6">PROPIEDAD / CÓD</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3">HUÉSPED / CANAL</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3">FECHAS / OCUP.</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3 text-right">IMPORTE Y ESTADO</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3 pr-6 text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <p className="text-lg font-bold text-slate-300">No hay reservas con estos filtros</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => (
                <TableRow key={booking.id} className="group hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  {/* Column 1: Property & Code */}
                  <TableCell className="py-2.5 pl-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 tracking-tight text-sm">
                        {booking.property?.name || "N/A"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {booking.booking_code}
                      </span>
                    </div>
                  </TableCell>

                  {/* Column 2: Guest & Type/Channel */}
                  <TableCell className="py-2.5">
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold text-slate-800 text-sm">
                        {booking.person ? `${booking.person.first_name} ${booking.person.last_name}` : "N/A"}
                      </span>
                      {booking.person?.phone && (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold mt-0.5">
                          <Phone className="h-2.5 w-2.5" />
                          <span>{booking.person.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {booking.booking_type && (
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                            {booking.booking_type.label}
                          </span>
                        )}
                        {booking.channel && (
                          <span className="text-[9px] font-medium text-slate-400 uppercase">
                            • {booking.channel.person.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Column 3: Dates & Guests */}
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                          <span>{formatDate(booking.check_in_date)}</span>
                          <span className="text-slate-300">→</span>
                          <span>{formatDate(booking.check_out_date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                        <Users className="h-3 w-3" />
                        <span>{booking.number_of_guests}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Column 4: Amount & Status */}
                  <TableCell className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <div className="flex flex-col items-end tabular-nums">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatCurrency(booking.total_amount)}
                        </span>
                        {booking.pending_amount > 0 && (
                          <span className="text-[9px] font-bold text-slate-500">
                            Pend: {formatCurrency(booking.pending_amount)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-[100px] flex justify-end">
                        {(() => {
                          let label = booking.booking_status?.label || 'Confirmada';
                          let bgColor = 'bg-emerald-50';
                          let textColor = 'text-emerald-700';
                          let dotColor = 'bg-emerald-500';

                          if (label === 'Cancelada' || label === 'Cancelado') {
                            bgColor = 'bg-red-50';
                            textColor = 'text-red-700';
                            dotColor = 'bg-red-500';
                          } else if (booking.pending_amount > 0) {
                            if (booking.paid_amount > 0) {
                              label = 'Pago Parcial';
                              bgColor = 'bg-amber-50';
                              textColor = 'text-amber-700';
                              dotColor = 'bg-amber-500';
                            } else {
                              label = 'Pendiente Pago';
                              bgColor = 'bg-red-50';
                              textColor = 'text-red-700';
                              dotColor = 'bg-red-500';
                            }
                          }

                          return (
                            <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider", bgColor, textColor)}>
                              <div className={cn("w-1 h-1 rounded-full", dotColor)} />
                              {label}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </TableCell>

                  {/* Column 5: Actions */}
                  <TableCell className="py-2.5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all">
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl">
                          <DropdownMenuItem asChild className="font-bold">
                            <Link href={`/dashboard/bookings/${booking.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(booking.id)}
                            className="text-red-500 font-bold focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de paginación (solo escritorio) */}
      {filteredBookings.length > 0 && (
        <div className="hidden md:flex items-center justify-between px-2 pt-2">
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

