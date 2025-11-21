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
import type { TreasuryAccount } from "@/types/treasury-accounts"
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

interface TreasuryAccountsTableProps {
  accounts: TreasuryAccount[]
}

export function TreasuryAccountsTable({ accounts }: TreasuryAccountsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/treasury-accounts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Error al eliminar la cuenta"
        
        toast({
          title: "No se puede eliminar",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        })
        return
      }

      toast({
        title: "Cuenta eliminada",
        description: "La cuenta de tesorería ha sido eliminada correctamente",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la cuenta",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay cuentas de tesorería registradas</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Número de Cuenta</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{account.account_number || "-"}</TableCell>
                <TableCell>{account.bank_name || "-"}</TableCell>
                <TableCell>
                  <Badge variant={account.is_active ? "default" : "secondary"}>
                    {account.is_active ? "Activa" : "Inactiva"}
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
                        <Link href={`/dashboard/treasury-accounts/${account.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDeletingId(account.id)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-destructive"
                        disabled={deletingId === account.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === account.id ? "Eliminando..." : "Eliminar"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la cuenta de tesorería permanentemente.
              No se puede eliminar si tiene movimientos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const accountToDelete = accounts.find((a) => deletingId === a.id)
                if (accountToDelete) {
                  handleDelete(accountToDelete.id)
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

