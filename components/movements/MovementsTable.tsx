"use client"

import { useState } from "react"
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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import type { MovementWithDetails } from "@/types/movements"
import { useToast } from "@/hooks/use-toast"
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
}

export function MovementsTable({ movements }: MovementsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

      router.refresh()
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

  if (movements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay movimientos registrados</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
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
            {movements.map((movement) => {
              const isIncome =
                movement.movement_type?.value === "income" ||
                movement.movement_type?.label === "Ingreso"
              
              const concept = isIncome
                ? movement.booking
                  ? `Reserva ${movement.booking.booking_code}`
                  : "Ingreso"
                : movement.service_provider
                ? movement.service_provider.person?.full_name || "Gasto"
                : "Gasto"

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
                  <TableCell className="font-medium">{concept}</TableCell>
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

