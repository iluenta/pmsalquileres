"use client"

import { useState, useMemo, useEffect } from "react"
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
import { MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
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
import { ServiceProviderCard } from "./ServiceProviderCard"

interface ServiceProvidersTableProps {
  providers: ServiceProviderWithDetails[]
}

const ITEMS_PER_PAGE = 5

export function ServiceProvidersTable({ providers }: ServiceProvidersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  // Pagination logic
  const totalPages = Math.ceil(providers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedProviders = useMemo(() => {
    return providers.slice(startIndex, endIndex)
  }, [providers, startIndex, endIndex])

  // Reset page to 1 when providers change
  useEffect(() => {
    setCurrentPage(1)
  }, [providers.length])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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
      {/* Mobile View: Cards */}
      <div className="block md:hidden space-y-4">
        {paginatedProviders.map((provider) => (
          <ServiceProviderCard key={provider.id} provider={provider} onDelete={() => router.refresh()} />
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 px-2">
          <p>
            Mostrando {startIndex + 1} - {Math.min(endIndex, providers.length)} de {providers.length} proveedor{providers.length !== 1 ? "es" : ""}
          </p>
        </div>
        <div className="rounded-[2rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden border border-slate-100">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Logo</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Nombre</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Email</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Teléfono</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Servicios</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Estado</TableHead>
                <TableHead className="py-5 px-6 text-right font-black text-[10px] uppercase tracking-widest text-slate-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProviders.map((provider) => (
                <TableRow key={provider.id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                  <TableCell className="py-4 px-6">
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
                          {(provider.person.full_name || "S").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium py-4 px-6">{provider.person.full_name}</TableCell>
                  <TableCell className="py-4 px-6">{provider.person.email || "-"}</TableCell>
                  <TableCell className="py-4 px-6">{provider.person.phone || "-"}</TableCell>
                  <TableCell className="py-4 px-6">
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
                  <TableCell className="py-4 px-6">
                    <Badge variant={provider.is_active ? "default" : "secondary"}>
                      {provider.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
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
                          onClick={() => {
                            setDeletingId(provider.id)
                            setDeleteDialogOpen(true)
                          }}
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
      </div>

      {/* Pagination Controls - Shared for Mobile and Desktop */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between sm:justify-end space-x-2 mt-8 mb-12 py-6 px-4 border-t border-slate-100 bg-white/50 rounded-b-[2rem] shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:mr-6">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-10 px-4 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-10 px-4 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

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
                if (deletingId) {
                  handleDelete(deletingId)
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
