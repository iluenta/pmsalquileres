"use client"

import { useState } from "react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Wrench, Percent, Receipt, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import type { ServiceProviderServiceWithDetails } from "@/types/service-providers"

interface ServiceCardProps {
  service: ServiceProviderServiceWithDetails
  onEdit: () => void
  onDelete: () => void
  deleting?: boolean
}

export function ServiceCard({ service, onEdit, onDelete, deleting }: ServiceCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">
              {service.service_type?.label || "N/A"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {service.price_type === "fixed" ? "Precio Fijo" : "Porcentaje"}
            </Badge>
            <Badge
              variant={service.is_active ? "default" : "secondary"}
              className={service.is_active ? "bg-green-600" : ""}
            >
              {service.is_active ? (
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
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            {service.price_type === "fixed" ? (
              <>
                <span>{service.price.toFixed(2)} €</span>
              </>
            ) : (
              <>
                <Percent className="h-5 w-5" />
                <span>{service.price.toFixed(2)}%</span>
              </>
            )}
          </div>
          {service.apply_tax && service.tax_type && (
            <div className="flex items-center gap-2 text-sm">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Impuesto:</span>
              <Badge variant="secondary">
                {service.tax_type.label} ({service.tax_type.description}%)
              </Badge>
            </div>
          )}
          {!service.apply_tax && (
            <div className="text-sm text-muted-foreground italic">
              Sin impuesto
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={deleting}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:border-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el servicio del proveedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteDialogOpen(false)
                onDelete()
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

