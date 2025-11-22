"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { MoreHorizontal, Edit, Trash2, Building2, CreditCard, CheckCircle2, XCircle } from "lucide-react"
import type { TreasuryAccount } from "@/types/treasury-accounts"

interface TreasuryAccountCardProps {
  account: TreasuryAccount
  onDelete?: () => void
}

export function TreasuryAccountCard({ account, onDelete }: TreasuryAccountCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

      setDeleteId(null)
      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la cuenta",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold">
            {account.name}
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
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
              onClick={() => setDeleteId(account.id)}
              disabled={deletingId === account.id}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deletingId === account.id ? "Eliminando..." : "Eliminar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        {account.account_number && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Número: {account.account_number}</span>
          </div>
        )}
        {account.bank_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{account.bank_name}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <Badge
            variant={account.is_active ? "default" : "secondary"}
            className={account.is_active ? "bg-green-600" : ""}
          >
            {account.is_active ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Activa
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                Inactiva
              </>
            )}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/treasury-accounts/${account.id}/edit`}>Editar</Link>
        </Button>
      </CardFooter>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => {
        if (!open && !deletingId) {
          setDeleteId(null)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la cuenta de tesorería permanentemente.
              No se puede eliminar si tiene movimientos asociados.
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
    </Card>
  )
}

