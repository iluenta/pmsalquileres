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
import { MoreHorizontal, Edit, Trash2, Building2, Percent, Receipt, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import type { SalesChannelWithDetails } from "@/types/sales-channels"

interface SalesChannelCardProps {
  channel: SalesChannelWithDetails
  onDelete?: () => void
}

export function SalesChannelCard({ channel, onDelete }: SalesChannelCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/sales-channels/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el canal")
      }

      toast({
        title: "Canal eliminado",
        description: "El canal de venta ha sido eliminado correctamente",
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
        description: error.message || "Error al eliminar el canal",
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
          {channel.logo_url ? (
            <div className="relative h-12 w-12 flex-shrink-0">
              <Image
                src={channel.logo_url}
                alt={channel.person.full_name}
                fill
                className="object-contain rounded"
              />
            </div>
          ) : (
            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
              Sin logo
            </div>
          )}
          <CardTitle className="text-lg font-semibold">
            {channel.person.full_name}
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
              <Link href={`/dashboard/sales-channels/${channel.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteId(channel.id)}
              disabled={deletingId === channel.id}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deletingId === channel.id ? "Eliminando..." : "Eliminar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{channel.person.email || "Sin email"}</span>
        </div>
        {channel.person.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{channel.person.phone}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Percent className="h-4 w-4" />
              <span className="text-xs">Comisión Venta</span>
            </div>
            <div className="text-lg font-semibold text-primary">
              {channel.sales_commission}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Percent className="h-4 w-4" />
              <span className="text-xs">Comisión Cobro</span>
            </div>
            <div className="text-lg font-semibold text-primary">
              {channel.collection_commission}%
            </div>
          </div>
        </div>
        {channel.apply_tax && channel.tax_type && (
          <div className="flex items-center gap-2 text-sm">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Impuesto:</span>
            <Badge variant="outline">
              {channel.tax_type.label}
              {channel.tax_type.description && (
                <span className="ml-1">({parseFloat(channel.tax_type.description)}%)</span>
              )}
            </Badge>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <Badge
            variant={channel.is_active ? "default" : "secondary"}
            className={channel.is_active ? "bg-green-600" : ""}
          >
            {channel.is_active ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Activo
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                Inactivo
              </>
            )}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/sales-channels/${channel.id}/edit`}>Editar</Link>
        </Button>
      </CardFooter>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => {
        if (!open && !deletingId) {
          setDeleteId(null)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar canal de venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el canal de venta
              {deleteId && channel.id === deleteId && (
                <> <strong>{channel.person.full_name}</strong></>
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
    </Card>
  )
}

