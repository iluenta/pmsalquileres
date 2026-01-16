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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Edit, Trash2, Building2, Mail, Phone, Wrench, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import type { ServiceProviderWithDetails } from "@/types/service-providers"

interface ServiceProviderCardProps {
  provider: ServiceProviderWithDetails
  onDelete?: () => void
}

export function ServiceProviderCard({ provider, onDelete }: ServiceProviderCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isServicesOpen, setIsServicesOpen] = useState(false)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/service-providers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar el proveedor")
      }

      toast({
        title: "Proveedor eliminado",
        description: "El proveedor de servicios ha sido eliminado correctamente",
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
        description: error.message || "Error al eliminar el proveedor",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  const servicesCount = provider.services?.length || 0

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          {provider.logo_url ? (
            <div className="relative h-12 w-12 flex-shrink-0">
              <Image
                src={provider.logo_url}
                alt={provider.person.full_name}
                fill
                className="object-contain rounded"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold text-muted-foreground">
                {(provider.person.full_name || "S").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <CardTitle className="text-lg font-semibold">
            {provider.person.full_name}
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
              <Link href={`/dashboard/service-providers/${provider.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteId(provider.id)}
              disabled={deletingId === provider.id}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deletingId === provider.id ? "Eliminando..." : "Eliminar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{provider.person.email || "Sin email"}</span>
        </div>
        {provider.person.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{provider.person.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Servicios:</span>
          <Badge variant="outline">
            {servicesCount} {servicesCount === 1 ? "servicio" : "servicios"}
          </Badge>
        </div>
        {servicesCount > 0 && (
          <Collapsible open={isServicesOpen} onOpenChange={setIsServicesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between px-0 text-sm text-muted-foreground hover:text-foreground">
                <span>Ver servicios</span>
                {isServicesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {provider.services?.map((service) => (
                <div
                  key={service.id}
                  className="border-l-2 border-primary/20 pl-3 space-y-1 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {service.service_type?.label || "N/A"}
                    </span>
                    <Badge
                      variant={service.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {service.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {service.price_type === "fixed"
                      ? `${service.price.toFixed(2)} €`
                      : `${service.price.toFixed(2)}%`}
                    {service.apply_tax && service.tax_type && (
                      <span className="ml-2">
                        + {service.tax_type.label} ({service.tax_type.description}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
        <div className="flex items-center justify-between pt-2">
          <Badge
            variant={provider.is_active ? "default" : "secondary"}
            className={provider.is_active ? "bg-green-600" : ""}
          >
            {provider.is_active ? (
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
          <Link href={`/dashboard/service-providers/${provider.id}/edit`}>Editar</Link>
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
              Esta acción no se puede deshacer. Se eliminará el proveedor de servicios y todos sus servicios asociados.
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

