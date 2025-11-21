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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import type { ServiceProviderWithDetails } from "@/types/service-providers"
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

interface ServiceProvidersTableProps {
  providers: ServiceProviderWithDetails[]
}

export function ServiceProvidersTable({ providers }: ServiceProvidersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el proveedor",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
    }
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay proveedores de servicios registrados</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Servicios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>
                  {provider.logo_url ? (
                    <div className="relative h-10 w-10">
                      <Image
                        src={provider.logo_url}
                        alt={provider.person.full_name}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        {provider.person.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{provider.person.full_name}</TableCell>
                <TableCell>{provider.person.email || "-"}</TableCell>
                <TableCell>{provider.person.phone || "-"}</TableCell>
                <TableCell>
                  {provider.services && provider.services.length > 0 ? (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex flex-wrap gap-1 cursor-help group">
                          {provider.services.slice(0, 3).map((service) => (
                            <Badge 
                              key={service.id} 
                              variant="outline" 
                              className="text-xs group-hover:border-primary/50 transition-colors"
                            >
                              {service.service_type?.label || "N/A"}
                            </Badge>
                          ))}
                          {provider.services.length > 3 && (
                            <Badge 
                              variant="outline" 
                              className="text-xs group-hover:border-primary/50 transition-colors"
                            >
                              +{provider.services.length - 3}
                            </Badge>
                          )}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80" side="right" align="start">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold mb-3">
                              Servicios Configurados ({provider.services.length})
                            </h4>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {provider.services.map((service) => (
                                <div
                                  key={service.id}
                                  className="border-l-2 border-primary/20 pl-3 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                      {service.service_type?.label || "N/A"}
                                    </span>
                                    <Badge
                                      variant={service.is_active ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {service.is_active ? "Activo" : "Inactivo"}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs font-normal">
                                        {service.price_type === "fixed"
                                          ? "Precio Fijo"
                                          : "Porcentaje"}
                                      </Badge>
                                      <span className="font-semibold text-foreground">
                                        {service.price_type === "fixed"
                                          ? `${service.price.toFixed(2)} €`
                                          : `${service.price.toFixed(2)}%`}
                                      </span>
                                    </div>
                                    {service.apply_tax && service.tax_type ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-muted-foreground">Impuesto:</span>
                                        <Badge variant="secondary" className="text-xs font-normal">
                                          {service.tax_type.label} ({service.tax_type.description}%)
                                        </Badge>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground italic">
                                        Sin impuesto
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin servicios</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={provider.is_active ? "default" : "secondary"}>
                    {provider.is_active ? "Activo" : "Inactivo"}
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
                        <Link href={`/dashboard/service-providers/${provider.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteDialogOpen(true)}
                        className="text-destructive"
                        disabled={deletingId === provider.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === provider.id ? "Eliminando..." : "Eliminar"}
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
              Esta acción no se puede deshacer. Se eliminará el proveedor de servicios y todos sus servicios asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const providerToDelete = providers.find((p) => deletingId === p.id)
                if (providerToDelete) {
                  handleDelete(providerToDelete.id)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

