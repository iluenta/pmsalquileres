"use client"

import React, { useState, useMemo } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { MoreHorizontal, Edit, Trash2, Package, ChevronLeft, ChevronRight } from "lucide-react"
import type { MovementWithDetails } from "@/types/movements"
import { useToast } from "@/hooks/use-toast"
import { MovementCard } from "./MovementCard"
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

interface MovementsTableProps {
  movements: MovementWithDetails[]
  onMovementDeleted?: () => void
}

const ITEMS_PER_PAGE = 5

export function MovementsTable({ movements, onMovementDeleted }: MovementsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

      toast({
        title: "Movimiento eliminado",
        description: "El movimiento ha sido eliminado correctamente",
      })

      // Recargar los movimientos
      if (onMovementDeleted) {
        onMovementDeleted()
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
      setDeleteDialogOpen(false)
    }
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

  // Calcular paginación
  const totalPages = Math.ceil(movements.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedMovements = useMemo(() => {
    return movements.slice(startIndex, endIndex)
  }, [movements, startIndex, endIndex])

  // Resetear a la primera página cuando cambian los movimientos
  React.useEffect(() => {
    setCurrentPage(1)
  }, [movements.length])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay movimientos registrados</p>
      </div>
    )
  }

  return (
    <>
      {/* Vista de tarjetas para móvil */}
      <div className="block md:hidden space-y-4">
        {movements.map((movement) => (
          <MovementCard
            key={movement.id}
            movement={movement}
            onDelete={onMovementDeleted}
          />
        ))}
      </div>

      {/* Vista de tabla para escritorio */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Importe</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMovements.map((movement) => {
              const isIncome =
                movement.movement_type?.value === "income" ||
                movement.movement_type?.label === "Ingreso"
              
              // Construir el concepto con información detallada de la reserva si existe
              let concept: string | React.ReactNode = ""
              if (isIncome) {
                if (movement.booking) {
                  const guestName = movement.booking.person
                    ? `${movement.booking.person.first_name || ""} ${movement.booking.person.last_name || ""}`.trim()
                    : null
                  
                  const formatBookingDate = (dateString?: string) => {
                    if (!dateString) return ""
                    return new Date(dateString).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  }
                  
                  const checkInDate = formatBookingDate(movement.booking.check_in_date)
                  const checkOutDate = formatBookingDate(movement.booking.check_out_date)
                  
                  concept = (
                    <div className="space-y-1">
                      <div className="font-medium">
                        Reserva {movement.booking.booking_code}
                      </div>
                      {guestName && (
                        <div className="text-sm text-muted-foreground">
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
                  concept = "Ingreso"
                }
              } else {
                concept = movement.service_provider
                  ? movement.service_provider.person?.full_name || "Gasto"
                  : "Gasto"
              }
              
              const expenseItemsCount = movement.expense_items?.length || 0
              const hasMultipleServices = expenseItemsCount > 1

              return (
                <TableRow key={movement.id}>
                  <TableCell>{formatDate(movement.movement_date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={isIncome ? "default" : "secondary"}
                      className={isIncome ? "bg-green-600" : ""}
                    >
                      {movement.movement_type?.label || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {concept}
                      {!isIncome && hasMultipleServices && (
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Badge variant="outline" className="cursor-help text-xs">
                              <Package className="h-3 w-3 mr-1" />
                              {expenseItemsCount} servicios
                            </Badge>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80" side="right" align="start">
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-sm font-semibold mb-3">
                                  Servicios del Gasto ({expenseItemsCount})
                                </h4>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {movement.expense_items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="border-l-2 border-primary/20 pl-3 space-y-1"
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
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={isIncome ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(movement.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {movement.payment_method?.label || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {movement.treasury_account?.name || "N/A"}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
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
                          onClick={() => {
                            setDeletingId(movement.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-destructive"
                          disabled={deletingId === movement.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === movement.id ? "Eliminando..." : "Eliminar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Controles de paginación (solo escritorio) */}
      {totalPages > 1 && (
        <div className="hidden md:flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} - {Math.min(endIndex, movements.length)} de {movements.length} movimientos
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el movimiento permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const movementToDelete = movements.find((m) => deletingId === m.id)
                if (movementToDelete) {
                  handleDelete(movementToDelete.id)
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

