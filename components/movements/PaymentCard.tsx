"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, Building2, FileText } from "lucide-react"
import type { MovementWithDetails } from "@/types/movements"
import { getMovementEditRoute } from "@/lib/utils/movements"

interface PaymentCardProps {
  payment: MovementWithDetails
}

export function PaymentCard({ payment }: PaymentCardProps) {
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
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <CardTitle className="text-base font-semibold truncate">
                {formatDate(payment.movement_date)}
              </CardTitle>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Importe:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              Método:
            </span>
            <Badge variant="outline" className="text-xs">
              {payment.payment_method?.label || "N/A"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              Cuenta:
            </span>
            <span className="font-medium text-right truncate ml-2">
              {payment.treasury_account?.name || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado:</span>
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
          </div>
          {(payment.reference || payment.invoice_number) && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Referencia:
              </span>
              <span className="font-medium text-right truncate ml-2">
                {payment.reference || payment.invoice_number || "-"}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={getMovementEditRoute(payment)}>
              Editar
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

