"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import type { MovementWithDetails, BookingPaymentInfo } from "@/types/movements"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MovementForm } from "./MovementForm"
import { PaymentCard } from "./PaymentCard"

interface BookingPaymentsManagerProps {
  bookingId: string
  tenantId: string
}

export function BookingPaymentsManager({
  bookingId,
  tenantId,
}: BookingPaymentsManagerProps) {
  const { toast } = useToast()
  const toastRef = useRef(toast)
  const [payments, setPayments] = useState<MovementWithDetails[]>([])
  const [paymentInfo, setPaymentInfo] = useState<BookingPaymentInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  const loadPayments = useCallback(async () => {
    if (!bookingId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/movements/bookings/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        setPaymentInfo(data.paymentInfo || null)
      }
    } catch (error) {
      console.error("Error loading payments:", error)
      toastRef.current({
        title: "Error",
        description: "Error al cargar los pagos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const handlePaymentCreated = () => {
    setDialogOpen(false)
    loadPayments()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <>
      <div className="space-y-4">
        {paymentInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total a Pagar</p>
              <p className="text-lg font-semibold">
                {formatCurrency(paymentInfo.total_to_pay)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagado</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(paymentInfo.paid_amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendiente</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatCurrency(paymentInfo.pending_amount)}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold mb-2">Pagos de la Reserva</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona los pagos recibidos para esta reserva
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            size="sm"
            disabled={paymentInfo?.pending_amount === 0}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Añadir Pago
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Cargando pagos...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">No hay pagos registrados</p>
            {paymentInfo && paymentInfo.pending_amount > 0 && (
              <Button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="mt-4"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Registrar Primer Pago
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop: Table */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Importe</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.movement_date)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.payment_method?.label || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {payment.treasury_account?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.movement_status?.value === "paid" ||
                            payment.movement_status?.label === "Pagado"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {payment.movement_status?.label || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.reference || payment.invoice_number || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/dashboard/movements/${payment.id}/edit`}>
                            Editar
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: Cards */}
            <div className="block md:hidden space-y-4">
              {payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Registra un nuevo pago para esta reserva
            </DialogDescription>
          </DialogHeader>
          <MovementForm
            tenantId={tenantId}
            onSave={handlePaymentCreated}
            defaultBookingId={bookingId}
            defaultMovementType="income"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

