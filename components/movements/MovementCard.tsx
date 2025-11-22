"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Edit, Trash2, Calendar, Package, ChevronDown, Building2, User } from "lucide-react"
import type { MovementWithDetails } from "@/types/movements"

interface MovementCardProps {
  movement: MovementWithDetails
  onDelete?: () => void
}

export function MovementCard({ movement, onDelete }: MovementCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isServicesOpen, setIsServicesOpen] = useState(false)

  const isIncome =
    movement.movement_type?.value === "income" ||
    movement.movement_type?.label === "Ingreso"

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

  const formatBookingDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/movements/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Error al eliminar el movimiento"
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        })
        return
      }

      setDeleteId(null)
      
      toast({
        title: "Movimiento eliminado",
        description: "El movimiento ha sido eliminado correctamente",
      })

      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el movimiento",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Construir el concepto
  let concept: React.ReactNode = ""
  if (isIncome) {
    if (movement.booking) {
      const guestName = movement.booking.person
        ? `${movement.booking.person.first_name || ""} ${movement.booking.person.last_name || ""}`.trim()
        : null
      
      const checkInDate = formatBookingDate(movement.booking.check_in_date)
      const checkOutDate = formatBookingDate(movement.booking.check_out_date)
      
      concept = (
        <div className="space-y-1">
          <div className="font-medium flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            Reserva {movement.booking.booking_code}
          </div>
          {movement.booking.property && (
            <div className="text-xs text-muted-foreground">
              {movement.booking.property.name}
            </div>
          )}
          {guestName && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {guestName}
            </div>
          )}
          {(checkInDate || checkOutDate) && (
            <div className="text-xs text-muted-foreground">
              {checkInDate && checkOutDate 
                ? `${checkInDate} / ${checkOutDate}`
                : checkInDate || checkOutDate}
            </div>
          )}
        </div>
      )
    } else {
      concept = <span className="text-muted-foreground">Ingreso</span>
    }
  } else {
    concept = movement.service_provider
      ? (
          <div className="space-y-1">
            <div className="font-medium">
              {movement.service_provider.person?.full_name || "Gasto"}
            </div>
            {movement.expense_items && movement.expense_items.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {movement.expense_items.length} servicio{movement.expense_items.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )
      : <span className="text-muted-foreground">Gasto</span>
  }

  const expenseItemsCount = movement.expense_items?.length || 0
  const hasMultipleServices = expenseItemsCount > 1

  return (
    <>
      <Card className="relative">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">
                  {formatDate(movement.movement_date)}
                </CardTitle>
              </div>
              <Badge
                variant={isIncome ? "default" : "secondary"}
                className={isIncome ? "bg-green-600" : ""}
              >
                {movement.movement_type?.label || "N/A"}
              </Badge>
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
                    <Link href={`/dashboard/movements/${movement.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeleteId(movement.id)}
                    disabled={deletingId === movement.id}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === movement.id ? "Eliminando..." : "Eliminar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Concepto */}
          <div className="font-medium">
            {concept}
            {!isIncome && hasMultipleServices && (
              <Collapsible open={isServicesOpen} onOpenChange={setIsServicesOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-auto p-2 text-xs"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    Ver {expenseItemsCount} servicios
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {movement.expense_items?.map((item) => (
                    <div
                      key={item.id}
                      className="border-l-2 border-primary/20 pl-3 space-y-1 py-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {item.service_name}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          {formatCurrency(item.total_amount)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <div>
                          Base: {formatCurrency(item.amount)}
                        </div>
                        {item.tax_amount > 0 && (
                          <div>
                            Impuesto: {formatCurrency(item.tax_amount)}
                            {item.tax_type && (
                              <span className="ml-1">
                                ({item.tax_type.label})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          {/* Importe */}
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Importe:</span>
              <span
                className={`text-lg font-bold ${
                  isIncome ? "text-green-600" : "text-red-600"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(movement.amount)}
              </span>
            </div>
          </div>

          {/* Detalles */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Método de pago:</span>
              <Badge variant="outline" className="text-xs">
                {movement.payment_method?.label || "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Cuenta:</span>
              <span className="font-medium">
                {movement.treasury_account?.name || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge
                variant={
                  movement.movement_status?.value === "paid" ||
                  movement.movement_status?.label === "Pagado"
                    ? "default"
                    : "secondary"
                }
              >
                {movement.movement_status?.label || "N/A"}
              </Badge>
            </div>
            {movement.invoice_number && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Factura:</span>
                <span className="font-medium">{movement.invoice_number}</span>
              </div>
            )}
            {movement.reference && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Referencia:</span>
                <span className="font-medium">{movement.reference}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/dashboard/movements/${movement.id}/edit`}>
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
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el movimiento permanentemente.
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

