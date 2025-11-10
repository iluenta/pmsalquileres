import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getBookingById } from "@/lib/api/bookings"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Calendar, Users, Euro, Building2, User, Phone, Mail, FileText, Clock, UserCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function ViewBookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: userInfo } = await supabase.rpc("get_user_info", {
    p_user_id: user.id,
  })

  if (!userInfo || userInfo.length === 0) {
    redirect("/login")
  }

  const tenantId = userInfo[0].tenant_id

  // Obtener la reserva
  const booking = await getBookingById(id, tenantId)

  if (!booking) {
    redirect("/dashboard/bookings")
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
    } catch {
      return new Date(dateString).toLocaleDateString("es-ES")
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'a las' HH:mm", { locale: es })
    } catch {
      return new Date(dateString).toLocaleString("es-ES")
    }
  }

  const formatDateShort = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
    } catch {
      return new Date(dateString).toLocaleDateString("es-ES")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const nights = calculateNights(booking.check_in_date, booking.check_out_date)
  const pendingAmount = booking.total_amount - booking.paid_amount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Reserva {booking.booking_code}
            </h1>
            <p className="text-muted-foreground">
              Detalles de la reserva
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/bookings/${booking.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna Principal - Información General y Fechas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Código de Reserva
                  </Label>
                  <p className="text-lg font-semibold mt-1">{booking.booking_code}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Estado
                  </Label>
                  <div className="mt-1">
                    {booking.booking_status ? (
                      <Badge
                        variant="secondary"
                        className="mt-1"
                        style={{
                          backgroundColor: booking.booking_status.color
                            ? `${booking.booking_status.color}20`
                            : undefined,
                          color: booking.booking_status.color || undefined,
                          borderColor: booking.booking_status.color || undefined,
                        }}
                      >
                        {booking.booking_status.label}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-1">Sin estado</Badge>
                    )}
                  </div>
                </div>
              </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Propiedad
              </Label>
              <p className="font-medium mt-1">
                {booking.property?.name || "N/A"}
              </p>
              {booking.property?.property_code && (
                <p className="text-sm text-muted-foreground mt-1">
                  Código: {booking.property.property_code}
                </p>
              )}
            </div>
            {booking.booking_type && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Tipo de Reserva
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: booking.booking_type.color
                          ? `${booking.booking_type.color}20`
                          : undefined,
                        color: booking.booking_type.color || undefined,
                        borderColor: booking.booking_type.color || undefined,
                      }}
                    >
                      {booking.booking_type.label}
                    </Badge>
                  </div>
                </div>
              </>
            )}
              {booking.channel && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Canal de Venta
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      {booking.channel.logo_url && (
                        <div className="relative h-10 w-10 border rounded-md overflow-hidden">
                          <Image
                            src={booking.channel.logo_url}
                            alt={booking.channel.person.full_name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">
                          {booking.channel.person.full_name}
                        </p>
                        {booking.channel.person.email && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {booking.channel.person.email}
                          </p>
                        )}
                        {booking.channel.person.phone && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {booking.channel.person.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    {booking.channel_booking_number && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <p className="text-sm font-medium">
                          Número de Reserva del Canal: <span className="text-primary">{booking.channel_booking_number}</span>
                        </p>
                      </div>
                    )}
                    {booking.channel.apply_tax && booking.channel.tax_type && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Impuesto aplicado: <span className="font-medium">{booking.channel.tax_type.label}</span> ({booking.channel.tax_type.description}%)
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Fechas y Estancia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas y Estancia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Fecha de Entrada
                  </Label>
                  <p className="font-medium text-lg">{formatDate(booking.check_in_date)}</p>
                  <p className="text-sm text-muted-foreground">{formatDateShort(booking.check_in_date)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Fecha de Salida
                  </Label>
                  <p className="font-medium text-lg">{formatDate(booking.check_out_date)}</p>
                  <p className="text-sm text-muted-foreground">{formatDateShort(booking.check_out_date)}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Noches
                  </Label>
                  <p className="font-medium text-lg mt-1">{nights} {nights === 1 ? "noche" : "noches"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Huéspedes
                  </Label>
                  <p className="font-medium text-lg mt-1">{booking.number_of_guests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Huésped - Solo para reservas comerciales */}
          {booking.booking_type?.label !== 'Período Cerrado' && booking.person && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Huésped
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Nombre Completo
                  </Label>
                  <p className="font-medium text-lg mt-1">
                    {`${booking.person.first_name} ${booking.person.last_name}`}
                  </p>
                </div>
                {(booking.person?.email || booking.person?.phone) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.person?.email && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </Label>
                          <p className="font-medium mt-1 break-all">{booking.person.email}</p>
                        </div>
                      )}
                      {booking.person?.phone && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Teléfono
                          </Label>
                          <p className="font-medium mt-1">{booking.person.phone}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{booking.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Lateral - Información Financiera */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Label className="text-sm font-medium text-muted-foreground">
                  Importe Total
                </Label>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(booking.total_amount)}
                </p>
              </div>

              {(booking.sales_commission_amount > 0 || booking.collection_commission_amount > 0 || booking.tax_amount > 0) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Desglose de Comisiones</Label>
                    
                    {booking.sales_commission_amount > 0 && (
                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">Comisión de Venta</p>
                            {booking.channel && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {booking.channel.sales_commission}% del total
                              </p>
                            )}
                          </div>
                          <p className="font-semibold text-orange-600">
                            -{formatCurrency(booking.sales_commission_amount)}
                          </p>
                        </div>
                      </div>
                    )}

                    {booking.collection_commission_amount > 0 && (
                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">Comisión de Cobro</p>
                            {booking.channel && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {booking.channel.collection_commission}% del total
                              </p>
                            )}
                          </div>
                          <p className="font-semibold text-orange-600">
                            -{formatCurrency(booking.collection_commission_amount)}
                          </p>
                        </div>
                      </div>
                    )}

                    {booking.tax_amount > 0 && (
                      <div className="p-3 bg-muted rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">Impuesto</p>
                            {booking.channel?.tax_type && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {booking.channel.tax_type.description}% sobre comisiones
                              </p>
                            )}
                          </div>
                          <p className="font-semibold text-orange-600">
                            -{formatCurrency(booking.tax_amount)}
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator />
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Importe Neto
                      </Label>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {formatCurrency(booking.net_amount || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total - Comisiones - Impuesto
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator />
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Importe Pagado
                  </Label>
                  <p className="font-semibold text-lg mt-1">
                    {formatCurrency(booking.paid_amount)}
                  </p>
                </div>
                <Separator />
                <div className="p-4 rounded-lg border-2" style={{
                  backgroundColor: pendingAmount > 0 ? "rgba(251, 146, 60, 0.1)" : "rgba(34, 197, 94, 0.1)",
                  borderColor: pendingAmount > 0 ? "rgba(251, 146, 60, 0.3)" : "rgba(34, 197, 94, 0.3)",
                }}>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Pendiente de Pago
                  </Label>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      pendingAmount > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(pendingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Auditoría */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Creado
                </Label>
                <p className="text-sm font-medium mt-1">
                  {formatDateTime(booking.created_at)}
                </p>
              </div>
              {booking.updated_at && booking.updated_at !== booking.created_at && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">
                      Última Actualización
                    </Label>
                    <p className="text-sm font-medium mt-1">
                      {formatDateTime(booking.updated_at)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

