"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Clock,
  Euro,
  Mail,
  Phone,
  User,
  Building2,
  FileText,
  CreditCard,
  ChevronLeft,
  Users,
  UserCircle,
  Pencil
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { BookingDetailTabs } from "@/components/bookings/BookingDetailTabs"
import { BookingPaymentsManager } from "@/components/movements/BookingPaymentsManager"

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userInfo } = useAuth()
  const tenantId = userInfo?.tenant_id
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id && tenantId) {
      fetchBooking()
    }
  }, [params.id, tenantId])

  async function fetchBooking() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/bookings/${params.id}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      const data = await response.json()
      setBooking(data)
    } catch (err: any) {
      console.error('Error fetching booking:', err)
      setError(err.message || 'Error al cargar la reserva')
    } finally {
      setLoading(false)
    }
  }

  // Formatters defined locally for robustness
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM, yyyy", { locale: es })
    } catch {
      return dateString
    }
  }

  const formatDateShort = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEE, dd MMM", { locale: es })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es })
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

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="h-20 border-b bg-white flex items-center px-4 md:px-8 shrink-0">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-8 space-y-8 overflow-auto">
          <Skeleton className="h-[200px] w-full rounded-[2rem]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <Skeleton className="h-[300px] rounded-[2rem]" />
              <Skeleton className="h-[300px] rounded-[2rem]" />
            </div>
            <Skeleton className="h-[500px] rounded-[2rem]" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="text-center p-8 bg-white rounded-[2rem] shadow-xl max-w-md mx-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">
            {error || 'Reserva no encontrada'}
          </h2>
          <p className="text-slate-500 mb-8 font-medium">
            No pudimos encontrar la reserva que buscas o ha ocurrido un error al cargarla.
          </p>
          <Button
            onClick={() => router.back()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 font-bold transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            Volver al listado
          </Button>
        </div>
      </div>
    )
  }

  const checkIn = new Date(booking.check_in_date)
  const checkOut = new Date(booking.check_out_date)
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  const pendingAmount = booking.pending_amount !== undefined ? booking.pending_amount : (booking.total_amount || 0) - (booking.paid_amount || 0)

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Fixed Header */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">
                Reserva {booking.booking_code}
              </h1>
              {booking.booking_status && (
                <Badge
                  variant="secondary"
                  className="rounded-lg px-2.5 py-1 font-black uppercase text-[10px] tracking-widest shadow-none border-none"
                  style={{
                    backgroundColor: booking.booking_status.color ? `${booking.booking_status.color}15` : '#f1f5f9',
                    color: booking.booking_status.color || '#64748b'
                  }}
                >
                  {booking.booking_status.label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/bookings/${booking.id}/edit`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 gap-2">
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Editar Reserva</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          <BookingDetailTabs
            detailsContent={
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Columna Principal - Información General y Fechas */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Información General */}
                  <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                        <FileText className="text-indigo-600 h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tighter">Información General</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detalles básicos</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                          Código de Reserva
                        </Label>
                        <p className="text-xl font-black text-slate-900 tracking-tight ml-1">{booking.booking_code}</p>
                      </div>

                      {booking.property && (
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Propiedad
                          </Label>
                          <div className="flex items-center gap-3 ml-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 tracking-tight">{booking.property.name}</p>
                              {booking.property.property_code && (
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  Cod: {booking.property.property_code}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {booking.booking_type && (
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Tipo de Reserva
                          </Label>
                          <div className="ml-1">
                            <Badge
                              variant="secondary"
                              className="rounded-lg px-2.5 py-0.5 font-black uppercase text-[10px] tracking-widest shadow-none border-none"
                              style={{
                                backgroundColor: booking.booking_type.color ? `${booking.booking_type.color}15` : '#f1f5f9',
                                color: booking.booking_type.color || '#64748b'
                              }}
                            >
                              {booking.booking_type.label}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {booking.channel && (
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Canal de Venta
                          </Label>
                          <div className="flex items-center gap-3 ml-1 mt-1">
                            {booking.channel.logo_url && (
                              <div className="relative h-8 w-8 border border-slate-100 rounded-lg overflow-hidden bg-white">
                                <Image
                                  src={booking.channel.logo_url}
                                  alt={booking.channel.person?.full_name || 'Logo'}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-black text-slate-900 tracking-tight">{booking.channel.person?.full_name || 'N/A'}</p>
                              {booking.channel_booking_number && (
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
                                  REF: {booking.channel_booking_number}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Fechas y Estancia */}
                  <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                        <Calendar className="text-indigo-600 h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tighter">Fechas y Estancia</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calendario</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Calendar className="h-12 w-12 text-slate-900" />
                        </div>
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                          Entrada
                        </Label>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{formatDate(booking.check_in_date)}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{formatDateShort(booking.check_in_date)}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Calendar className="h-12 w-12 text-amber-600" />
                        </div>
                        <Label className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-2">
                          Salida
                        </Label>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{formatDate(booking.check_out_date)}</p>
                        <p className="text-[11px] font-bold text-amber-500 mt-1 uppercase tracking-widest">{formatDateShort(booking.check_out_date)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-8">
                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Noches</p>
                          <p className="text-xl font-black text-slate-900 tracking-tight">{nights}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                          <Users className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Huéspedes</p>
                          <p className="text-xl font-black text-slate-900 tracking-tight">{booking.number_of_guests}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Información del Huésped */}
                  {booking.booking_type?.label !== 'Período Cerrado' && booking.person && (
                    <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                          <User className="text-indigo-600 h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-slate-900 tracking-tighter">Información del Huésped</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Titular</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nombre</Label>
                          <p className="text-xl font-black text-slate-900 tracking-tight">{`${booking.person.first_name} ${booking.person.last_name}`}</p>
                        </div>
                        <div className="space-y-4">
                          {booking.person?.email && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                <Mail className="h-4 w-4 text-indigo-600" />
                              </div>
                              <p className="font-bold text-slate-600 text-sm break-all">{booking.person.email}</p>
                            </div>
                          )}
                          {booking.person?.phone && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                <Phone className="h-4 w-4 text-indigo-600" />
                              </div>
                              <p className="font-bold text-slate-600 text-sm">{booking.person.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Notas */}
                  {booking.notes && (
                    <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                          <FileText className="text-indigo-600 h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notas</h2>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="whitespace-pre-wrap text-sm font-medium text-slate-600 leading-relaxed">{booking.notes}</p>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Columna Lateral - Información Financiera */}
                <div className="space-y-8">
                  <Card className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                        <Euro className="text-indigo-600 h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tighter">Finanzas</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Importes y pagos</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 rounded-[1.5rem] bg-indigo-600 shadow-lg shadow-indigo-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Euro className="h-16 w-16 text-white" />
                        </div>
                        <Label className="text-[10px] font-black uppercase tracking-widest text-teal-100 block mb-2">
                          Importe Total
                        </Label>
                        <p className="text-3xl font-black text-white tracking-tighter">
                          {formatCurrency(booking.total_amount)}
                        </p>
                      </div>

                      {(booking.sales_commission_amount > 0 || booking.collection_commission_amount > 0 || booking.tax_amount > 0) && (
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-3">Comisiones</Label>

                          {booking.sales_commission_amount > 0 && (
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-xs font-bold text-slate-500">Comisión Venta</span>
                              <span className="font-black text-slate-900">-{formatCurrency(booking.sales_commission_amount)}</span>
                            </div>
                          )}

                          {booking.collection_commission_amount > 0 && (
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-xs font-bold text-slate-500">Comisión Cobro</span>
                              <span className="font-black text-slate-900">-{formatCurrency(booking.collection_commission_amount)}</span>
                            </div>
                          )}

                          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 mt-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-1">Importe Neto</Label>
                            <p className="text-xl font-black text-indigo-600 tracking-tighter">
                              {formatCurrency(booking.net_amount || 0)}
                            </p>
                          </div>
                        </div>
                      )}

                      <Separator className="bg-slate-100" />

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pagado</Label>
                          <p className="font-black text-emerald-600 tracking-tight">
                            {formatCurrency(booking.paid_amount || 0)}
                          </p>
                        </div>

                        <div className={cn(
                          "p-5 rounded-2xl border transition-all",
                          pendingAmount > 0 ? "bg-amber-50/30 border-amber-100" : "bg-emerald-50/30 border-emerald-100"
                        )}>
                          <Label className={cn(
                            "text-[10px] font-black uppercase tracking-widest block mb-1",
                            pendingAmount > 0 ? "text-amber-600" : "text-emerald-500"
                          )}>
                            Pendiente de Pago
                          </Label>
                          <p className={cn(
                            "text-2xl font-black tracking-tighter",
                            pendingAmount > 0 ? "text-amber-600" : "text-emerald-600"
                          )}>
                            {formatCurrency(pendingAmount)}
                          </p>
                        </div>
                      </div>

                      {/* Sistema */}
                      <div className="pt-6 border-t border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCircle className="h-4 w-4 text-slate-300" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Sistema</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label className="text-[10px] font-bold text-slate-400 uppercase block">Creado</Label>
                            <p className="text-xs font-black text-slate-600 mt-0.5">{formatDateTime(booking.created_at)}</p>
                          </div>
                          {booking.updated_at && booking.updated_at !== booking.created_at && (
                            <div>
                              <Label className="text-[10px] font-bold text-slate-400 uppercase block">Última Actualización</Label>
                              <p className="text-xs font-black text-slate-600 mt-0.5">{formatDateTime(booking.updated_at)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            }
            paymentsContent={
              <div className="space-y-8">
                <Card className="bg-white p-6 md:p-10 rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
                      <CreditCard className="text-indigo-600 h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Gestión de Pagos</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Movimientos financieros</p>
                    </div>
                  </div>
                  {tenantId && <BookingPaymentsManager bookingId={booking.id} tenantId={tenantId} />}
                </Card>
              </div>
            }
          />
        </div>
      </main>
    </div>
  )
}
